import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/hooks';
import type { RootStackParamList } from '../navigation/navigation';
import { selectUser } from '../redux/slices/authSlice';
import { clearStores, selectCartItems } from '../redux/slices/basketSlice';
import { resetCheckoutDraft, selectCheckoutDraft, setDraftAddress, setDraftCoupon } from '../redux/slices/checkoutDraftSlice';
import { Feather } from '@expo/vector-icons';
import { useCartQuote } from '../features/checkout/useCartQuote';
import { placeOrder, type PlaceOrderResult } from '../features/checkout/placeOrder';
import { fetchAddresses, fetchStore, type FulfilmentType, type SavedAddress } from '../features/commerce/api';
import { cartSignature, newIdempotencyKey, quoteLines } from '../features/food/cartLine';
import { apiErrorCode, foodCheckoutErrorCopy } from '../features/food/checkoutErrors';
import { placeFoodOrders } from '../features/food/placeFoodOrder';
import { storeSupportsPickup, type FoodStore } from '../features/food/format';
import { useRemote } from '../features/food/useRemote';
import FulfilmentSection from '../features/food/components/FulfilmentSection';
import SavedAddressPicker from '../features/food/components/SavedAddressPicker';
import DeliverySection, { type LocationStatus } from '../features/checkout/components/DeliverySection';
import PaymentMethodSection from '../features/checkout/components/PaymentMethodSection';
import OrderSummaryCard from '../features/checkout/components/OrderSummaryCard';
import { VerticalThemeProvider, useVerticalTheme } from '../contexts/VerticalThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatMoney } from '../utils/money';
import { errorMessage, notify } from '../utils/notify';
import {
  Card,
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
  OptionRow,
  PrimaryButton,
  ScreenHeader,
  SectionHeader,
} from '../components/kudya';
import type { CartItem } from '../services/types';

type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;

function verticalForItems(items: CartItem[], fallback?: string): string | undefined {
  if (fallback) return fallback;
  const verticals = new Set(items.map((item) => item.vertical).filter(Boolean));
  return verticals.size === 1 ? Array.from(verticals)[0] : undefined;
}

function CheckoutContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proof, setProof] = useState<{ uri: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fulfilment, setFulfilment] = useState<FulfilmentType>('delivery');
  const inFlight = useRef(false);

  const draft = useSelector(selectCheckoutDraft);
  const groceryStoreIds = Array.from(
    new Set(items.filter((item) => item.vertical === 'groceries').map((item) => item.store)),
  );

  /** Food-only carts go through /api/v1/food/checkout/ (pickup, line instructions, Idempotency-Key). */
  const foodMode = items.length > 0 && items.every((item) => item.vertical === 'food');
  const foodStoreIds = useMemo(
    () => (foodMode ? Array.from(new Set(items.map((item) => item.store))).sort((a, b) => a - b) : []),
    [foodMode, items],
  );
  const foodStores = useRemote<FoodStore[]>(
    () => Promise.all(foodStoreIds.map((storeId) => fetchStore('food', storeId))),
    [foodStoreIds.join(',')],
  );
  const pickupAllowed =
    foodMode && !!foodStores.data?.length && foodStores.data.every((store) => storeSupportsPickup(store));
  const pickup = foodMode && fulfilment === 'pickup';
  const savedAddresses = useRemote<SavedAddress[]>(
    () => (foodMode && user?.token ? fetchAddresses() : Promise.resolve([])),
    [foodMode, user?.token],
  );

  useEffect(() => {
    if (fulfilment === 'pickup' && !foodStores.loading && !pickupAllowed) setFulfilment('delivery');
  }, [fulfilment, foodStores.loading, pickupAllowed]);

  /** A new key whenever the cart contents change; retries of the same cart reuse it so the server dedupes. */
  const cartKey = useMemo(() => cartSignature(quoteLines(items)), [items]);
  const idempotencyRef = useRef<{ cart: string; key: string } | null>(null);
  if (!idempotencyRef.current || idempotencyRef.current.cart !== cartKey) {
    idempotencyRef.current = { cart: cartKey, key: newIdempotencyKey() };
  }
  const idempotencyKey = idempotencyRef.current.key;

  useEffect(() => {
    if (draft.couponCode && draft.couponCode !== appliedCoupon) {
      setCouponInput(draft.couponCode);
      setAppliedCoupon(draft.couponCode);
    }
  }, [draft.couponCode, appliedCoupon]);

  useEffect(() => {
    if (!draft.address) return;
    setAddress(draft.address.address);
    if (draft.address.instructions) setNotes(draft.address.instructions);
    if (draft.address.latitude !== null && draft.address.longitude !== null) {
      setCoords({ latitude: draft.address.latitude, longitude: draft.address.longitude });
      setLocationStatus('ready');
      setUseCurrentLocation(true);
    } else {
      setUseCurrentLocation(false);
    }
  }, [draft.address]);

  const { quote, loading: quoting, error: quoteError, refresh } = useCartQuote(
    items,
    appliedCoupon,
    foodMode ? { vertical: 'food', fulfilmentType: fulfilment } : {},
  );

  const locate = useCallback(async () => {
    setLocationStatus('locating');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('unavailable');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setLocationStatus('ready');
    } catch {
      setLocationStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    if (useCurrentLocation && locationStatus === 'idle') void locate();
  }, [useCurrentLocation, locationStatus, locate]);

  const pickProof = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setProof({ uri: result.assets[0].uri, name: result.assets[0].name });
  }, []);

  const couponError = appliedCoupon && quote?.coupon_error ? quote.coupon_error : null;

  const describeFoodError = (error: unknown): string => {
    const copy = foodCheckoutErrorCopy(apiErrorCode(error));
    return copy ? t(copy.key, copy.fallback) : errorMessage(error, t('ckOrderFailed', 'We could not place your order.'));
  };

  const submit = async () => {
    if (inFlight.current) return;
    setSubmitError(null);
    if (!user?.token) {
      navigation.navigate('UserLogin');
      return;
    }
    const hasCoords = useCurrentLocation && coords !== null;
    if (!pickup && !hasCoords && !address.trim()) {
      setSubmitError(t('ckAddressRequired', 'Enter a delivery address or allow location access.'));
      return;
    }
    if (!paymentMethod) {
      setSubmitError(t('ckPaymentRequired', 'Choose a payment method.'));
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const delivery = {
        address,
        location: hasCoords ? coords : null,
        useCurrentLocation: hasCoords,
        notes,
      };
      const payment = { method: paymentMethod, phone: paymentPhone, proof };
      const result: PlaceOrderResult = foodMode
        ? await placeFoodOrders({
            items,
            token: user.token,
            fulfilmentType: pickup ? 'pickup' : 'delivery',
            couponCode: couponError ? undefined : appliedCoupon,
            quote,
            delivery,
            payment,
            idempotencyKey,
            describeError: describeFoodError,
          })
        : await placeOrder({
            items,
            token: user.token,
            couponCode: couponError ? undefined : appliedCoupon,
            delivery,
            payment,
            grocery: {
              slots: draft.slots,
              substitutionDefault: draft.substitutionDefault,
              itemSubstitutions: draft.itemSubstitutions,
            },
          });
      if (result.orders.length === 0) {
        setSubmitError(result.failures[0]?.error ?? t('ckOrderFailed', 'We could not place your order.'));
        refresh();
        return;
      }
      dispatch(clearStores(result.placedStoreIds));
      dispatch(resetCheckoutDraft());
      if (result.authorizationUrl) {
        void Linking.openURL(result.authorizationUrl);
      }
      if (result.failures.length > 0) {
        notify(t('ckPartialOrder', 'Some orders were placed, but not all.'), result.failures.map((f) => f.error).join('\n'));
      }
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'OrderPlaced',
            params: {
              orderIds: result.orders.map((order) => order.order_id),
              vertical: theme.key,
              notices: result.paymentNotices,
              orders: result.orders.map((order) => ({
                order_id: order.order_id,
                store_id: order.store_id,
                secret_pin: order.secret_pin,
                total: order.total,
                currency: order.currency,
                payment_method: order.payment_method,
                fulfilment_type: order.fulfilment_type,
              })),
            },
          },
        ],
      });
    } catch (error) {
      setSubmitError(foodMode ? describeFoodError(error) : errorMessage(error, t('ckOrderFailed', 'We could not place your order.')));
      refresh();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('ckCheckout', 'Checkout')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="lock"
          title={t('ckLoginRequired', 'Sign in to continue')}
          body={t('ckLoginRequiredBody', 'You need an account to place an order and track delivery.')}
          actionLabel={t('ckSignIn', 'Sign in')}
          onAction={() => navigation.navigate('UserLogin')}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('ckCheckout', 'Checkout')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="shopping-bag"
          title={t('ckCartEmpty', 'Your cart is empty')}
          body={t('ckCartEmptyBody', 'Add something tasty or a few groceries to get started.')}
          actionLabel={t('ckStartShopping', 'Start shopping')}
          onAction={() => navigation.navigate('MainTabs')}
        />
      </View>
    );
  }

  const canSubmit =
    !!quote && !quote.has_errors && !quoting && !submitting && !couponError && !(pickup && !pickupAllowed);

  const chooseSavedAddress = (saved: SavedAddress) => {
    const latitude = saved.latitude === null ? null : Number(saved.latitude);
    const longitude = saved.longitude === null ? null : Number(saved.longitude);
    dispatch(
      setDraftAddress({
        id: saved.id,
        label: saved.label,
        address: saved.address,
        latitude: latitude !== null && Number.isFinite(latitude) ? latitude : null,
        longitude: longitude !== null && Number.isFinite(longitude) ? longitude : null,
        instructions: saved.instructions,
      }),
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title={t('ckCheckout', 'Checkout')}
        subtitle={t('ckItems', '{count} items', { count: items.length })}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        {foodMode ? (
          <FulfilmentSection
            value={pickup ? 'pickup' : 'delivery'}
            onChange={setFulfilment}
            pickupAllowed={pickupAllowed}
            loadingStores={foodStores.loading}
            stores={foodStores.data ?? []}
          />
        ) : null}

        {foodMode && !pickup && user.token ? (
          <SavedAddressPicker
            addresses={savedAddresses.data ?? []}
            loading={savedAddresses.loading}
            error={!!savedAddresses.error}
            selectedId={draft.address?.id ?? null}
            onSelect={chooseSavedAddress}
            onRetry={savedAddresses.reload}
            onManage={() => navigation.navigate('Addresses', { selectMode: true, vertical: theme.key })}
          />
        ) : null}

        {!pickup ? (
          <DeliverySection
            useCurrentLocation={useCurrentLocation}
            onToggleCurrentLocation={(value) => {
              setUseCurrentLocation(value);
              if (value && locationStatus !== 'ready') void locate();
            }}
            locationStatus={locationStatus}
            address={address}
            onAddressChange={setAddress}
            notes={notes}
            onNotesChange={setNotes}
            savedAddressLabel={draft.address?.label || null}
            onChooseSaved={() => navigation.navigate('Addresses', { selectMode: true, vertical: theme.key })}
          />
        ) : null}

        {groceryStoreIds.length > 0 ? (
          <View>
            <SectionHeader title={t('ckDeliveryTime', 'Delivery time')} />
            <View style={styles.rows}>
              {groceryStoreIds.map((storeId) => {
                const slot = draft.slots[String(storeId)];
                const storeName =
                  quote?.stores.find((store) => store.store_id === storeId)?.store_name ||
                  items.find((item) => item.store === storeId)?.store_name ||
                  '';
                return (
                  <OptionRow
                    key={storeId}
                    title={slot ? `${slot.label ?? slot.date} · ${slot.start}–${slot.end}` : t('ckAsap', 'As soon as possible')}
                    subtitle={storeName}
                    onPress={() => navigation.navigate('DeliverySlot', { storeId })}
                    right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
                  />
                );
              })}
              <OptionRow
                title={t('ckSubstitutions', 'If an item is unavailable')}
                subtitle={
                  draft.substitutionDefault === 'allow_similar'
                    ? t('ckSubAllowSimilar', 'Allow a similar substitute')
                    : draft.substitutionDefault === 'remove'
                      ? t('ckSubRemove', 'Remove it from my order')
                      : t('ckSubSpecific', 'Use the substitutes I chose')
                }
                onPress={() => navigation.navigate('Substitutions')}
                right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
              />
            </View>
          </View>
        ) : null}

        <View>
          <SectionHeader
            title={t('ckCoupon', 'Coupon')}
            actionLabel={t('ckViewOffers', 'View offers')}
            onAction={() =>
              navigation.navigate('Coupons', { vertical: theme.key, subtotal: quote?.subtotal })
            }
          />
          <Card style={styles.couponCard}>
            <TextInput
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
              placeholder={t('ckCouponPlaceholder', 'Enter coupon code')}
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.couponInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />
            <Pressable
              onPress={() => {
                setAppliedCoupon(couponInput.trim());
                dispatch(setDraftCoupon(couponInput.trim()));
              }}
              style={[styles.couponButton, { backgroundColor: theme.colors.primary }]}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '800' }}>{t('ckApply', 'Apply')}</Text>
            </Pressable>
          </Card>
          {couponError ? <View style={styles.gapTop}><InlineError message={couponError} /></View> : null}
          {appliedCoupon && quote && !quote.coupon_error && Number(quote.discount_amount) > 0 ? (
            <Text style={[styles.couponOk, { color: theme.colors.success }]}>
              {t('ckCouponApplied', 'Coupon applied')} · -{formatMoney(quote.discount_amount, quote.currency)}
            </Text>
          ) : null}
        </View>

        <PaymentMethodSection
          serviceType={foodMode ? 'food' : 'order'}
          value={paymentMethod}
          onChange={setPaymentMethod}
          phone={paymentPhone}
          onPhoneChange={setPaymentPhone}
          proofName={proof?.name ?? null}
          onPickProof={() => void pickProof()}
        />

        {quote ? (
          <OrderSummaryCard quote={quote} />
        ) : quoteError ? (
          <ErrorState title={t('ckQuoteFailed', 'Could not price your cart.')} body={quoteError} onRetry={refresh} />
        ) : (
          <LoadingState label={t('ckPricingCart', 'Updating prices…')} />
        )}

        {submitError ? <InlineError message={submitError} /> : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: 14 + insets.bottom },
        ]}
      >
        <PrimaryButton
          testID="place-order"
          title={submitting ? t('ckPlacingOrder', 'Placing your order…') : t('ckPlaceOrder', 'Place order')}
          trailing={quote && !submitting ? formatMoney(quote.total, quote.currency) : undefined}
          onPress={() => void submit()}
          loading={submitting}
          disabled={!canSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function CheckoutPage() {
  const route = useRoute<CheckoutRoute>();
  const items = useSelector(selectCartItems);
  const vertical = verticalForItems(items, route.params?.vertical);
  return (
    <VerticalThemeProvider vertical={vertical}>
      <CheckoutContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 20 },
  couponCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 15 },
  couponButton: { height: 44, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  couponOk: { marginTop: 8, fontWeight: '700' },
  rows: { gap: 10 },
  gapTop: { marginTop: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
