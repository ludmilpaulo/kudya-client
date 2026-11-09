import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BottomSheet, InlineError, LoadingState, OptionRow, PrimaryButton } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { CartItem } from '../../../services/types';
import type { SubstitutionPreference } from '../../../redux/slices/checkoutDraftSlice';
import { formatMoney } from '../../../utils/money';
import { errorMessage } from '../../../utils/notify';
import { fetchProduct, fetchStoreProducts } from '../../commerce/api';
import { groceryProductImage, mapGroceryProduct, type GroceryProduct } from '../../groceries/types';
import { isOutOfStock, mapProducts } from '../product';
import { useRemote } from '../useRemote';

export type ItemChoice = { preference: SubstitutionPreference; substituteProductId: number | null };

async function loadCandidates(item: CartItem): Promise<GroceryProduct[]> {
  const [original, rows] = await Promise.all([
    fetchProduct('groceries', item.id)
      .then((raw: unknown) => mapGroceryProduct(raw))
      .catch(() => null),
    fetchStoreProducts('groceries', item.store),
  ]);
  const categoryId = original?.category?.id;
  return mapProducts(rows)
    .filter((product) => product.id !== item.id && !isOutOfStock(product))
    .sort((a, b) => Number(b.category?.id === categoryId) - Number(a.category?.id === categoryId));
}

type Props = {
  item: CartItem | null;
  value: ItemChoice;
  onClose: () => void;
  onSave: (choice: ItemChoice) => void;
};

export default function SubstitutionSheet({ item, value, onClose, onSave }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const [choice, setChoice] = useState<ItemChoice>(value);
  useEffect(
    () => setChoice({ preference: value.preference, substituteProductId: value.substituteProductId }),
    [value.preference, value.substituteProductId, item?.id],
  );

  const specific = choice.preference === 'specific';
  const candidates = useRemote(
    () => (item ? loadCandidates(item) : Promise.resolve([])),
    [item?.id, item?.store],
    !!item && specific,
  );

  const options: { key: SubstitutionPreference; title: string; subtitle: string }[] = [
    {
      key: 'allow_similar',
      title: t('grSubAllowSimilar', 'Allow a similar substitute'),
      subtitle: t('grSubAllowSimilarBody', 'Our shopper picks the closest match.'),
    },
    {
      key: 'specific',
      title: t('grSubSpecific', 'Choose a specific substitute'),
      subtitle: t('grSubSpecificBody', 'Pick the exact replacement you want.'),
    },
    {
      key: 'remove',
      title: t('grSubRemove', 'Remove this item from my order'),
      subtitle: t('grSubRemoveBody', 'You will not be charged for it.'),
    },
  ];

  return (
    <BottomSheet
      visible={!!item}
      onClose={onClose}
      title={item?.name ?? ''}
      footer={
        <PrimaryButton
          title={t('grSavePreference', 'Save Preference')}
          disabled={specific && !choice.substituteProductId}
          onPress={() => onSave(choice)}
        />
      }
    >
      <Text style={[styles.lead, { color: theme.colors.textMuted }]}>
        {t('grSubQuestion', 'If this item is unavailable, what would you like?')}
      </Text>
      <View style={styles.group}>
        {options.map((option) => (
          <OptionRow
            key={option.key}
            title={option.title}
            subtitle={option.subtitle}
            selected={choice.preference === option.key}
            onPress={() =>
              setChoice((prev) => ({
                preference: option.key,
                substituteProductId: option.key === 'specific' ? prev.substituteProductId : null,
              }))
            }
          />
        ))}
      </View>
      {specific ? (
        <View style={styles.candidates}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>{t('grPickSubstitute', 'Pick a substitute')}</Text>
          {candidates.loading ? (
            <LoadingState />
          ) : candidates.error ? (
            <InlineError message={errorMessage(candidates.error, t('grSubLoadError', 'Could not load alternatives.'))} />
          ) : !candidates.data?.length ? (
            <Text style={[styles.lead, { color: theme.colors.textMuted }]}>
              {t('grNoSubstitutes', 'No alternatives available in this store.')}
            </Text>
          ) : (
            <View style={styles.group}>
              {candidates.data.map((product) => {
                const image = groceryProductImage(product);
                return (
                  <OptionRow
                    key={product.id}
                    title={product.name}
                    subtitle={[formatMoney(product.price), product.unit].filter(Boolean).join(' · ')}
                    selected={choice.substituteProductId === product.id}
                    onPress={() => setChoice({ preference: 'specific', substituteProductId: product.id })}
                    left={
                      image ? (
                        <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" />
                      ) : (
                        <View style={[styles.thumb, { backgroundColor: theme.colors.primarySoft }]} />
                      )
                    }
                  />
                );
              })}
            </View>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 13, marginBottom: 10 },
  group: { gap: 8 },
  candidates: { marginTop: 16 },
  heading: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  thumb: { width: 40, height: 40, borderRadius: 8 },
});
