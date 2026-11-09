import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ErrorState,
  InlineError,
  LoadingState,
  OptionRow,
  PrimaryButton,
  QtyStepper,
} from '../../components/kudya';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { addItem } from '../../redux/slices/basketSlice';
import { useAppDispatch } from '../../redux/store';
import { formatMoney } from '../../utils/money';
import { errorMessage, toast } from '../../utils/notify';
import { fetchProduct, fetchStore } from '../../features/commerce/api';
import AddonGroupSection from '../../features/food/components/AddonGroupSection';
import IconButton from '../../features/food/components/IconButton';
import {
  addonsTotal,
  configurationLabel,
  selectedAddons,
  selectionIssues,
  toggleAddon,
  type AddonSelection,
} from '../../features/food/addons';
import { MAX_SPECIAL_INSTRUCTIONS, cartLineKey, normalizeInstructions } from '../../features/food/cartLine';
import {
  plainText,
  productCurrency,
  productDiscountBadge,
  productImage,
  productPrice,
  productSizes,
  productStrikePrice,
  storeIsOpen,
  type FoodProduct,
  type FoodStore,
} from '../../features/food/format';
import { useRemote } from '../../features/food/useRemote';

const MAX_QUANTITY = 50;

function Customiser({ product, store, storeId }: { product: FoodProduct; store: FoodStore | null; storeId: number }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const sizes = useMemo(() => productSizes(product), [product]);
  const groups = useMemo(() => product.addon_groups ?? [], [product.addon_groups]);
  const [sizeKey, setSizeKey] = useState<string | null>(sizes[0]?.key ?? null);
  const [selection, setSelection] = useState<AddonSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [showIssues, setShowIssues] = useState(false);

  useEffect(() => {
    setSizeKey((current) => (sizes.some((size) => size.key === current) ? current : sizes[0]?.key ?? null));
  }, [sizes]);

  const currency = productCurrency(product, store);
  const description = plainText(product.description || product.short_description);
  const size = sizes.find((option) => option.key === sizeKey) ?? null;
  const addons = selectedAddons(groups, selection);
  const issues = selectionIssues(groups, selection);
  const hasIssues = Object.keys(issues).length > 0 || (sizes.length > 0 && !size);
  const basePrice = size?.price ?? productPrice(product);
  const unitPrice = basePrice + addonsTotal(addons);
  const total = unitPrice * quantity;
  const strike = productStrikePrice(product);
  const image = productImage(product);
  const badge = productDiscountBadge(product);
  const open = store ? storeIsOpen(store) : true;
  const purchasable = product.is_purchasable !== false;
  const storeName = store?.name ?? product.store_name;

  const close = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('RestaurantDetails', { storeId }));

  const add = () => {
    if (hasIssues) {
      setShowIssues(true);
      toast('error', t('fdCompleteChoices', 'Complete the required choices'));
      return;
    }
    const note = normalizeInstructions(instructions);
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: Number(unitPrice.toFixed(2)),
        image: image ?? undefined,
        size: configurationLabel(size?.label ?? null, addons),
        quantity,
        store: storeId,
        store_name: storeName,
        vertical: 'food',
        addons: addons.length ? addons : undefined,
        special_instructions: note || undefined,
        line_key:
          addons.length || note
            ? cartLineKey(
                product.id,
                addons.map((addon) => addon.id),
                note,
              )
            : undefined,
      }),
    );
    toast('success', t('fdAddedToCart', 'Added to cart'), `${quantity} × ${product.name}`);
    close();
  };

  const buttonTitle = !open
    ? t('fdRestaurantClosed', 'Restaurant closed')
    : !purchasable
      ? t('fdUnavailable', 'Unavailable')
      : t('fdAddToCart', 'Add to cart');

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 140 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: theme.colors.primarySoft }]}>
          {image ? (
            <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Feather name="image" size={42} color={theme.colors.primary} />
          )}
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton testID="food-item-close" icon="x" label={t('fdClose', 'Close')} onPress={close} />
          </View>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.body, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{product.name}</Text>
          {storeName ? <Text style={[styles.store, { color: theme.colors.textMuted }]}>{storeName}</Text> : null}
          {description ? (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>{formatMoney(basePrice, currency)}</Text>
            {strike && !size?.price ? (
              <Text style={[styles.strike, { color: theme.colors.textMuted }]}>{formatMoney(strike, currency)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.sections}>
          {sizes.length ? (
            <View style={styles.section} testID="food-item-sizes">
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('fdChooseSize', 'Choose size')}</Text>
                <View style={[styles.pill, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={[styles.pillText, { color: theme.colors.primaryDark }]}>{t('fdRequired', 'Required')}</Text>
                </View>
              </View>
              {sizes.map((option) => (
                <OptionRow
                  key={option.key}
                  title={option.label}
                  subtitle={option.price ? formatMoney(option.price, currency) : undefined}
                  selected={option.key === sizeKey}
                  onPress={() => setSizeKey(option.key)}
                />
              ))}
              {showIssues && !size ? <InlineError message={t('fdChooseSizeError', 'Choose a size.')} /> : null}
            </View>
          ) : null}

          {groups.map((group) => (
            <AddonGroupSection
              key={group.id}
              group={group}
              selected={selection[group.id] ?? []}
              issue={issues[group.id] ?? null}
              showIssue={showIssues}
              currency={currency}
              onToggle={(addonId) => setSelection((current) => toggleAddon(group, current, addonId))}
            />
          ))}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('fdSpecialInstructions', 'Special instructions')}
              </Text>
              <View style={[styles.pill, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.pillText, { color: theme.colors.textMuted }]}>{t('fdOptional', 'Optional')}</Text>
              </View>
            </View>
            <TextInput
              testID="food-item-instructions"
              value={instructions}
              onChangeText={setInstructions}
              maxLength={MAX_SPECIAL_INSTRUCTIONS}
              multiline
              placeholder={t('fdSpecialInstructionsPlaceholder', 'E.g. no onions, sauce on the side')}
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel={t('fdSpecialInstructions', 'Special instructions')}
              style={[
                styles.instructions,
                { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface },
              ]}
            />
            <Text style={[styles.counter, { color: theme.colors.textMuted }]}>
              {instructions.length}/{MAX_SPECIAL_INSTRUCTIONS}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {showIssues && hasIssues ? (
          <InlineError message={t('fdFixChoices', 'Some choices still need your attention.')} />
        ) : null}
        <View style={styles.footerRow}>
          <QtyStepper
            value={quantity}
            onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
            onIncrement={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            disableIncrement={quantity >= MAX_QUANTITY}
          />
          <PrimaryButton
            testID="food-item-add"
            title={buttonTitle}
            trailing={open && purchasable ? formatMoney(total, currency) : undefined}
            disabled={!open || !purchasable}
            onPress={add}
            style={styles.addButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ItemCustomiseContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useAppRoute<'ItemCustomise'>();
  const productId = Number(params?.productId);
  const storeId = Number(params?.storeId);

  const product = useRemote<FoodProduct>(() => fetchProduct('food', productId), [productId]);
  const store = useRemote<FoodStore>(() => fetchStore('food', storeId), [storeId]);

  if (product.loading && !product.data) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.colors.background }]}>
        <LoadingState label={t('fdLoadingItem', 'Loading item…')} />
      </View>
    );
  }
  if (!product.data) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 }]}>
        <View style={styles.floatingBack}>
          <IconButton
            icon="chevron-left"
            label={t('fdBack', 'Back')}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('RestaurantDetails', { storeId }))}
          />
        </View>
        <ErrorState
          title={t('fdItemError', 'Could not load this item')}
          body={errorMessage(product.error, t('fdTryAgainLater', 'Please try again in a moment.'))}
          retryLabel={t('fdRetry', 'Try again')}
          onRetry={product.reload}
        />
      </View>
    );
  }
  return <Customiser key={product.data.id} product={product.data} store={store.data} storeId={storeId} />;
}

export default function ItemCustomiseScreen() {
  return (
    <VerticalThemeProvider vertical="food">
      <ItemCustomiseContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { justifyContent: 'center' },
  floatingBack: { paddingHorizontal: 16 },
  hero: { height: 260, alignItems: 'center', justifyContent: 'center' },
  heroBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row' },
  badge: { position: 'absolute', left: 16, bottom: 16, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  body: { padding: 18, gap: 6, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  name: { fontSize: 22, fontWeight: '900' },
  store: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  price: { fontSize: 20, fontWeight: '900' },
  strike: { fontSize: 14, textDecorationLine: 'line-through' },
  sections: { padding: 16, gap: 22 },
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addButton: { flex: 1 },
  instructions: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 80, fontSize: 14, textAlignVertical: 'top' },
  counter: { fontSize: 11, textAlign: 'right' },
});
