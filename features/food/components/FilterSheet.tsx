import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet, Chip, PrimaryButton } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { Cuisine } from '../../commerce/api';
import {
  DELIVERY_TIME_OPTIONS,
  EMPTY_FILTERS,
  PRICE_LEVEL_OPTIONS,
  RATING_OPTIONS,
  activeFilterCount,
  togglePriceLevel,
  type RestaurantFilterState,
} from '../filters';
import { priceLevelLabel } from '../format';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: RestaurantFilterState;
  onApply: (value: RestaurantFilterState) => void;
  cuisines: Cuisine[];
  currency: string;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

export default function FilterSheet({ visible, onClose, value, onApply, cuisines, currency }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RestaurantFilterState>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const count = activeFilterCount(draft);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('fdFilters', 'Filters')}
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            testID="food-filters-reset"
            title={t('fdReset', 'Reset')}
            variant="outline"
            onPress={() => setDraft(EMPTY_FILTERS)}
            style={styles.footerButton}
          />
          <PrimaryButton
            testID="food-filters-apply"
            title={count ? t('fdApplyCount', 'Apply ({count})', { count }) : t('fdApply', 'Apply')}
            onPress={() => onApply(draft)}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Group title={t('fdShow', 'Show')}>
        <Chip
          testID="food-filter-open-now"
          icon="clock"
          label={t('fdOpenNow', 'Open now')}
          selected={draft.openNow}
          onPress={() => setDraft({ ...draft, openNow: !draft.openNow })}
        />
        <Chip
          testID="food-filter-promotions"
          icon="tag"
          label={t('fdHasPromotion', 'Offers')}
          selected={draft.hasPromotion}
          onPress={() => setDraft({ ...draft, hasPromotion: !draft.hasPromotion })}
        />
        <Chip
          testID="food-filter-pickup"
          icon="shopping-bag"
          label={t('fdPickupAvailable', 'Pickup')}
          selected={draft.pickup}
          onPress={() => setDraft({ ...draft, pickup: !draft.pickup })}
        />
      </Group>

      {cuisines.length ? (
        <Group title={t('fdCuisine', 'Cuisine')}>
          <Chip label={t('fdAll', 'All')} selected={!draft.cuisine} onPress={() => setDraft({ ...draft, cuisine: null })} />
          {cuisines.map((cuisine) => (
            <Chip
              key={cuisine.id}
              label={cuisine.name}
              selected={draft.cuisine === cuisine.slug}
              onPress={() => setDraft({ ...draft, cuisine: draft.cuisine === cuisine.slug ? null : cuisine.slug })}
            />
          ))}
        </Group>
      ) : null}

      <Group title={t('fdPriceRange', 'Price range')}>
        <Chip label={t('fdAny', 'Any')} selected={!draft.priceLevels.length} onPress={() => setDraft({ ...draft, priceLevels: [] })} />
        {PRICE_LEVEL_OPTIONS.map((level) => (
          <Chip
            key={level}
            label={priceLevelLabel(level, currency) ?? String(level)}
            selected={draft.priceLevels.includes(level)}
            onPress={() => setDraft({ ...draft, priceLevels: togglePriceLevel(draft.priceLevels, level) })}
          />
        ))}
      </Group>

      <Group title={t('fdDeliveryTime', 'Delivery time')}>
        <Chip label={t('fdAny', 'Any')} selected={!draft.maxDeliveryMin} onPress={() => setDraft({ ...draft, maxDeliveryMin: null })} />
        {DELIVERY_TIME_OPTIONS.map((minutes) => (
          <Chip
            key={minutes}
            label={t('fdUnderMinutes', '≤ {minutes} min', { minutes })}
            selected={draft.maxDeliveryMin === minutes}
            onPress={() => setDraft({ ...draft, maxDeliveryMin: minutes })}
          />
        ))}
      </Group>

      <Group title={t('fdRating', 'Rating')}>
        <Chip label={t('fdAny', 'Any')} selected={!draft.minRating} onPress={() => setDraft({ ...draft, minRating: null })} />
        {RATING_OPTIONS.map((rating) => (
          <Chip
            key={rating}
            icon="star"
            label={`${rating.toFixed(1)}+`}
            selected={draft.minRating === rating}
            onPress={() => setDraft({ ...draft, minRating: rating })}
          />
        ))}
      </Group>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 14, gap: 10 },
  groupTitle: { fontSize: 15, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', gap: 10 },
  footerButton: { flex: 1 },
});
