import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet, OptionRow, PrimaryButton } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';

export type GrocerySort = 'relevance' | 'price_asc' | 'price_desc';
export type GroceryFilters = { onSale: boolean; inStock: boolean; sort: GrocerySort };

export const DEFAULT_FILTERS: GroceryFilters = { onSale: false, inStock: false, sort: 'relevance' };

type Props = {
  visible: boolean;
  value: GroceryFilters;
  onApply: (value: GroceryFilters) => void;
  onClose: () => void;
};

export default function FilterSheet({ visible, value, onApply, onClose }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const sorts: { key: GrocerySort; label: string }[] = [
    { key: 'relevance', label: t('grSortRelevance', 'Recommended') },
    { key: 'price_asc', label: t('grSortPriceLow', 'Price: low to high') },
    { key: 'price_desc', label: t('grSortPriceHigh', 'Price: high to low') },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('grFilters', 'Filters')}
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            title={t('grReset', 'Reset')}
            variant="outline"
            style={styles.flex}
            onPress={() => setDraft(DEFAULT_FILTERS)}
          />
          <PrimaryButton title={t('grApply', 'Apply')} style={styles.flex} onPress={() => onApply(draft)} />
        </View>
      }
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>{t('grShow', 'Show')}</Text>
      <View style={styles.group}>
        <OptionRow
          title={t('grOnSale', 'On sale')}
          selected={draft.onSale}
          onPress={() => setDraft((prev) => ({ ...prev, onSale: !prev.onSale }))}
        />
        <OptionRow
          title={t('grInStockOnly', 'In stock only')}
          selected={draft.inStock}
          onPress={() => setDraft((prev) => ({ ...prev, inStock: !prev.inStock }))}
        />
      </View>
      <Text style={[styles.heading, { color: theme.colors.text }]}>{t('grSortBy', 'Sort by')}</Text>
      <View style={styles.group}>
        {sorts.map((sort) => (
          <OptionRow
            key={sort.key}
            title={sort.label}
            selected={draft.sort === sort.key}
            onPress={() => setDraft((prev) => ({ ...prev, sort: sort.key }))}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { flexDirection: 'row', gap: 10 },
  heading: { fontSize: 14, fontWeight: '800', marginTop: 8, marginBottom: 8 },
  group: { gap: 8 },
});
