import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, OptionRow, SectionHeader } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { FulfilmentType } from '../../commerce/api';
import type { FoodStore } from '../format';

type Props = {
  value: FulfilmentType;
  onChange: (value: FulfilmentType) => void;
  /** Pickup is offered only when every restaurant in the cart has `supports_pickup`. */
  pickupAllowed: boolean;
  loadingStores: boolean;
  stores: FoodStore[];
};

export default function FulfilmentSection({ value, onChange, pickupAllowed, loadingStores, stores }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const icon = (name: React.ComponentProps<typeof Feather>['name']) => (
    <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
      <Feather name={name} size={18} color={theme.colors.primary} />
    </View>
  );
  return (
    <View>
      <SectionHeader title={t('fdHowToGetIt', 'How do you want it?')} />
      <View style={styles.rows}>
        <OptionRow
          title={t('fdDelivery', 'Delivery')}
          subtitle={t('fdDeliveryBody', 'A courier brings it to your door')}
          selected={value === 'delivery'}
          onPress={() => onChange('delivery')}
          left={icon('truck')}
        />
        {pickupAllowed ? (
          <OptionRow
            title={t('fdPickup', 'Pickup')}
            subtitle={t('fdPickupBody', 'Collect it at the restaurant — no delivery fee')}
            selected={value === 'pickup'}
            onPress={() => onChange('pickup')}
            left={icon('shopping-bag')}
          />
        ) : !loadingStores ? (
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {t('fdPickupNotOffered', 'Pickup is not offered by this restaurant.')}
          </Text>
        ) : null}
      </View>
      {value === 'pickup' && stores.length ? (
        <Card style={styles.pickupCard}>
          {stores.map((store) => (
            <View key={store.id} style={styles.pickupRow}>
              <Feather name="map-pin" size={16} color={theme.colors.primary} />
              <View style={styles.flex}>
                <Text style={[styles.storeName, { color: theme.colors.text }]}>{store.name}</Text>
                {store.address ? <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{store.address}</Text> : null}
              </View>
            </View>
          ))}
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {t('fdPickupPinHint', 'Show your order PIN at the counter to collect your food.')}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 13 },
  pickupCard: { marginTop: 10, gap: 10 },
  pickupRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  flex: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '800' },
});
