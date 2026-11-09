import React, { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { AppDispatch, RootState } from "../redux/store";
import { addItem, clearAllCart, removeItem, setItemQuantity } from "../redux/slices/basketSlice";
import { selectUser } from "../redux/slices/authSlice";
import type { RootStackParamList } from "../navigation/navigation";
import { useAppNavigation } from "../navigation/hooks";
import type { CartItem } from "../services/types";
import { analytics } from "../utils/mixpanel";
import { useCartQuote } from "../features/checkout/useCartQuote";
import { groupItemsByStore } from "../features/checkout/placeOrder";
import { lineKeyFor } from "../features/food/cartLine";
import { VerticalThemeProvider, useVerticalTheme } from "../contexts/VerticalThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { confirmAction } from "../utils/notify";
import { formatMoney } from "../utils/money";
import {
  Card,
  EmptyState,
  InlineError,
  PrimaryButton,
  PriceRow,
  QtyStepper,
  ScreenHeader,
} from "../components/kudya";

type CartRoute = RouteProp<RootStackParamList, "Cart">;

function CartContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const items: CartItem[] = useSelector((state: RootState) => state.basket.items);
  const foodOnly = items.length > 0 && items.every((item) => item.vertical === "food");
  const { quote, loading, error, refresh } = useCartQuote(items, "", foodOnly ? { vertical: "food" } : {});

  useEffect(() => {
    analytics.trackScreenView("Cart Screen", { items_count: items.length });
  }, []);

  const groups = useMemo(() => Array.from(groupItemsByStore(items)), [items]);
  const lineByKey = useMemo(
    () => new Map((quote?.lines ?? []).map((line) => [line.key || `p${line.product_id}`, line])),
    [quote?.lines],
  );
  const storeQuote = (storeId: number) => quote?.stores.find((store) => store.store_id === storeId);
  const currency = quote?.currency;

  const increment = (item: CartItem) =>
    dispatch(
      addItem({
        ...item,
        quantity: item.allows_fractional ? 0.5 : 1,
      }),
    );
  const decrement = (item: CartItem) =>
    dispatch(removeItem({ id: item.id, size: item.size || "", line_key: item.line_key }));
  const remove = (item: CartItem) => {
    analytics.trackRemoveFromCart(item.id.toString(), item.name);
    dispatch(setItemQuantity({ id: item.id, size: item.size || "", line_key: item.line_key, quantity: 0 }));
  };

  const clearCart = async () => {
    const confirmed = await confirmAction({
      title: t("ckClearCart", "Clear cart"),
      message: t("ckClearCartConfirm", "Remove all items from your cart?"),
      confirmText: t("ckClearCartYes", "Yes, clear"),
      cancelText: t("ckCancel", "Cancel"),
      destructive: true,
    });
    if (confirmed) dispatch(clearAllCart());
  };

  const goToCheckout = () => {
    if (!user) {
      navigation.navigate("UserLogin");
      return;
    }
    navigation.navigate("Checkout", { vertical: theme.key });
  };

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t("ckYourCart", "Your Cart")} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
        <EmptyState
          icon="shopping-cart"
          title={t("ckCartEmpty", "Your cart is empty")}
          body={t("ckCartEmptyBody", "Add something tasty or a few groceries to get started.")}
          actionLabel={t("ckStartShopping", "Start shopping")}
          onAction={() => navigation.navigate("MainTabs")}
        />
      </View>
    );
  }

  const blocked = !quote || quote.has_errors;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={`${t("ckYourCart", "Your Cart")} (${items.length})`}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={
          <Pressable onPress={() => void clearCart()} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("ckClearCart", "Clear cart")}>
            <Feather name="trash-2" size={20} color={theme.colors.error} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 220 + insets.bottom }]}>
        {groups.map(([storeId, storeItems]) => {
          const sq = storeQuote(storeId);
          return (
            <Card key={storeId} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <Feather name="shopping-bag" size={16} color={theme.colors.primary} />
                <Text style={[styles.storeName, { color: theme.colors.text }]} numberOfLines={1}>
                  {sq?.store_name || storeItems[0]?.store_name || t("ckFrom", "From {store}", { store: `#${storeId}` })}
                </Text>
              </View>
              {sq?.error ? <InlineError message={`${t("ckStoreIssue", "Fix this before checkout")}: ${sq.error}`} /> : null}
              {storeItems.map((item) => {
                const line = lineByKey.get(lineKeyFor(item));
                const lineTotal = line ? formatMoney(line.subtotal, currency) : loading ? "…" : "";
                return (
                  <View key={`${item.id}-${item.size}-${item.line_key ?? ""}`} style={[styles.item, { borderTopColor: theme.colors.border }]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                    ) : (
                      <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: theme.colors.primarySoft }]}>
                        <Feather name="image" size={18} color={theme.colors.primary} />
                      </View>
                    )}
                    <View style={styles.itemBody}>
                      <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.size ? (
                        <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{item.size}</Text>
                      ) : null}
                      {item.special_instructions ? (
                        <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]} numberOfLines={2}>
                          {t("ckLineNote", "Note: {note}", { note: item.special_instructions })}
                        </Text>
                      ) : null}
                      <View style={styles.itemFooter}>
                        <QtyStepper
                          compact
                          value={item.quantity}
                          unitLabel={item.allows_fractional ? item.selling_unit : undefined}
                          onIncrement={() => increment(item)}
                          onDecrement={() => decrement(item)}
                        />
                        <Text style={[styles.lineTotal, { color: theme.colors.text }]}>{lineTotal}</Text>
                      </View>
                    </View>
                    <Pressable onPress={() => remove(item)} hitSlop={8} accessibilityLabel={t("ckRemove", "Remove")}>
                      <Feather name="x" size={18} color={theme.colors.textMuted} />
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          );
        })}
        {error ? <InlineError message={error} /> : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: 14 + insets.bottom },
        ]}
      >
        {quote ? (
          <>
            <PriceRow label={t("ckSubtotal", "Subtotal")} value={formatMoney(quote.subtotal, currency)} />
            <PriceRow label={t("ckDeliveryFee", "Delivery fee")} value={formatMoney(quote.delivery_fee, currency)} />
            <PriceRow label={t("ckTotal", "Total")} value={formatMoney(quote.total, currency)} bold />
          </>
        ) : (
          <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
            {loading ? t("ckPricingCart", "Updating prices…") : t("ckQuoteFailed", "Could not price your cart.")}
          </Text>
        )}
        <PrimaryButton
          testID="proceed-checkout"
          title={t("ckProceedToCheckout", "Proceed to Checkout")}
          onPress={error && !quote ? refresh : goToCheckout}
          disabled={blocked && !(error && !quote)}
          loading={loading && !quote}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

export default function CartScreen() {
  const route = useRoute<CartRoute>();
  const items = useSelector((state: RootState) => state.basket.items);
  const verticals = new Set(items.map((item) => item.vertical).filter(Boolean));
  const vertical = route.params?.vertical ?? (verticals.size === 1 ? Array.from(verticals)[0] : undefined);
  return (
    <VerticalThemeProvider vertical={vertical}>
      <CartContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14 },
  storeCard: { gap: 10 },
  storeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  storeName: { fontSize: 15, fontWeight: "800", flex: 1 },
  item: { flexDirection: "row", gap: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  image: { width: 64, height: 64, borderRadius: 12 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  itemBody: { flex: 1, gap: 4 },
  itemName: { fontSize: 14, fontWeight: "700" },
  itemMeta: { fontSize: 12 },
  itemFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  lineTotal: { fontSize: 15, fontWeight: "800" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
