import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, OptionRow, PrimaryButton, ScreenHeader, SectionHeader } from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import {
  selectCheckoutDraft,
  setItemSubstitution,
  setSubstitutionDefault,
  type SubstitutionPreference,
} from '../../redux/slices/checkoutDraftSlice';
import type { CartItem } from '../../services/types';
import { fetchProduct } from '../../features/commerce/api';
import { toast } from '../../utils/notify';
import SubstitutionSheet, { type ItemChoice } from '../../features/groceryFlow/components/SubstitutionSheet';
import { useGroceryCart } from '../../features/groceryFlow/useGroceryCart';
import { useRemote } from '../../features/groceryFlow/useRemote';

function usePreferenceLabels() {
  const { t } = useTranslation();
  return {
    allow_similar: t('grSubAllowSimilar', 'Allow a similar substitute'),
    specific: t('grSubSpecific', 'Choose a specific substitute'),
    remove: t('grSubRemove', 'Remove this item from my order'),
  } satisfies Record<SubstitutionPreference, string>;
}

function SubstituteName({ productId }: { productId: number }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const product = useRemote(() => fetchProduct('groceries', productId), [productId]);
  const name = product.data?.name;
  return (
    <Text style={[styles.itemMeta, { color: theme.colors.primaryDark }]} numberOfLines={1}>
      {name ? t('grSubstituteWith', 'Replace with {name}', { name }) : t('grSubstituteChosen', 'Substitute selected')}
    </Text>
  );
}

function ItemRow({ item, choice, isDefault, onPress }: { item: CartItem; choice: ItemChoice; isDefault: boolean; onPress: () => void }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const labels = usePreferenceLabels();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('grEditSubstitution', 'Edit substitution for {name}', { name: item.name })}
      style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty, { backgroundColor: theme.colors.primarySoft }]}>
          <Feather name="shopping-bag" size={18} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.itemBody}>
        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name}
          {item.size ? ` · ${item.size}` : ''}
        </Text>
        <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {isDefault ? t('grUsingDefault', 'Default: {label}', { label: labels[choice.preference] }) : labels[choice.preference]}
        </Text>
        {choice.preference === 'specific' && choice.substituteProductId ? (
          <SubstituteName productId={choice.substituteProductId} />
        ) : null}
      </View>
      <Feather name="edit-2" size={16} color={theme.colors.primary} />
    </Pressable>
  );
}

function SubstitutionsContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const labels = usePreferenceLabels();
  const draft = useSelector(selectCheckoutDraft);
  const { groceryItems } = useGroceryCart();
  const [editing, setEditing] = useState<CartItem | null>(null);

  const choiceFor = (item: CartItem): { choice: ItemChoice; isDefault: boolean } => {
    const saved = draft.itemSubstitutions[String(item.id)];
    return saved
      ? { choice: { preference: saved.preference, substituteProductId: saved.substituteProductId ?? null }, isDefault: false }
      : { choice: { preference: draft.substitutionDefault, substituteProductId: null }, isDefault: true };
  };

  const back = navigation.canGoBack() ? () => navigation.goBack() : undefined;
  const defaults: SubstitutionPreference[] = ['allow_similar', 'specific', 'remove'];

  if (!groceryItems.length) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('grSubstitutions', 'Substitutions')} onBack={back} />
        <EmptyState
          icon="repeat"
          title={t('grSubEmpty', 'No grocery items in your cart')}
          body={t('grSubEmptyBody', 'Add groceries to choose what happens when an item is unavailable.')}
          actionLabel={t('grStartShopping', 'Start shopping')}
          onAction={() => navigation.navigate('GroceryHome')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('grSubstitutions', 'Substitutions')} onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <SectionHeader title={t('grSubDefaultTitle', 'For all items')} />
          <Text style={[styles.lead, { color: theme.colors.textMuted }]}>
            {t('grSubQuestion', 'If this item is unavailable, what would you like?')}
          </Text>
          <View style={styles.group}>
            {defaults.map((preference) => (
              <OptionRow
                key={preference}
                title={labels[preference]}
                selected={draft.substitutionDefault === preference}
                onPress={() => dispatch(setSubstitutionDefault(preference))}
              />
            ))}
          </View>
        </Card>

        <SectionHeader title={t('grSubPerItem', 'Per item')} />
        <View style={styles.group}>
          {groceryItems.map((item) => {
            const { choice, isDefault } = choiceFor(item);
            return (
              <ItemRow
                key={`${item.id}-${item.size}`}
                item={item}
                choice={choice}
                isDefault={isDefault}
                onPress={() => setEditing(item)}
              />
            );
          })}
        </View>
      </ScrollView>
      <View
        style={[
          styles.bar,
          { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}
      >
        <PrimaryButton
          title={t('grSavePreference', 'Save Preference')}
          onPress={() => {
            toast('success', t('grSubSaved', 'Substitution preferences saved'));
            if (back) back();
          }}
        />
      </View>

      <SubstitutionSheet
        item={editing}
        value={editing ? choiceFor(editing).choice : { preference: draft.substitutionDefault, substituteProductId: null }}
        onClose={() => setEditing(null)}
        onSave={(choice) => {
          if (editing) {
            dispatch(
              setItemSubstitution({
                productId: editing.id,
                preference: choice.preference,
                substituteProductId: choice.substituteProductId,
              }),
            );
          }
          setEditing(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  lead: { fontSize: 13, marginBottom: 10 },
  group: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1 },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  itemBody: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemMeta: { fontSize: 12 },
  bar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});

export default withVerticalTheme(SubstitutionsContent, () => 'groceries');
