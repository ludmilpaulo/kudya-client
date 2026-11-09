import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  OptionRow,
  PrimaryButton,
  ScreenHeader,
  SectionHeader,
} from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { selectCheckoutDraft, setDraftSlot, type DraftSlot } from '../../redux/slices/checkoutDraftSlice';
import { fetchDeliverySlots, type DeliverySlotDay, type DeliverySlotOption } from '../../features/commerce/api';
import { errorMessage, toast } from '../../utils/notify';
import { isNotFound } from '../../features/groceryFlow/product';
import { slotKey, slotRange } from '../../features/groceryFlow/slots';
import { useRemote } from '../../features/groceryFlow/useRemote';

const SLOT_DAYS = 7;

type Selection = { kind: 'asap' } | { kind: 'slot'; slot: DraftSlot };

function SlotRow({
  day,
  slot,
  selected,
  onSelect,
}: {
  day: DeliverySlotDay;
  slot: DeliverySlotOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const full = !slot.available || slot.remaining <= 0;
  return (
    <View style={full ? styles.disabled : undefined} accessibilityState={{ disabled: full }}>
      <OptionRow
        title={slotRange(slot)}
        subtitle={full ? undefined : t('grSlotsLeft', '{count} slots left', { count: slot.remaining })}
        selected={selected}
        onPress={full ? undefined : onSelect}
        left={<Feather name="clock" size={18} color={full ? theme.colors.textMuted : theme.colors.primary} />}
        right={
          full ? (
            <Text style={[styles.full, { color: theme.colors.error }]} accessibilityLabel={`${day.label} ${slotRange(slot)} full`}>
              {t('grSlotFull', 'Full')}
            </Text>
          ) : undefined
        }
      />
    </View>
  );
}

function DeliverySlotContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { params } = useAppRoute<'DeliverySlot'>();
  const { t } = useTranslation();
  const storeId = params.storeId;
  const draft = useSelector(selectCheckoutDraft);
  const saved = draft.slots[String(storeId)] ?? null;
  const slots = useRemote(() => fetchDeliverySlots(storeId, SLOT_DAYS), [storeId]);

  const [selection, setSelection] = useState<Selection>(saved ? { kind: 'slot', slot: saved } : { kind: 'asap' });
  const [activeDate, setActiveDate] = useState<string | null>(saved?.date ?? null);

  const days = slots.data?.days ?? [];
  const asap = slots.data?.asap;
  useEffect(() => {
    if (!days.length) return;
    if (!activeDate || !days.some((day) => day.date === activeDate)) setActiveDate(days[0].date);
  }, [days, activeDate]);

  useEffect(() => {
    if (selection.kind === 'asap' && asap && !asap.available) {
      const firstOpen = days.flatMap((day) => day.slots.map((slot) => ({ day, slot }))).find(({ slot }) => slot.available && slot.remaining > 0);
      if (firstOpen) {
        setActiveDate(firstOpen.day.date);
        setSelection({
          kind: 'slot',
          slot: { date: firstOpen.day.date, start: firstOpen.slot.start, end: firstOpen.slot.end, label: `${firstOpen.day.label}, ${slotRange(firstOpen.slot)}` },
        });
      }
    }
  }, [asap, days, selection.kind]);

  const back = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Checkout', { storeId, vertical: 'groceries' }));
  const confirm = (choice: Selection) => {
    dispatch(setDraftSlot({ storeId, slot: choice.kind === 'asap' ? null : choice.slot }));
    toast('success', t('grSlotSaved', 'Delivery time saved'), choice.kind === 'asap' ? t('grAsap', 'As soon as possible') : choice.slot.label);
    back();
  };

  const day = days.find((entry) => entry.date === activeDate) ?? days[0];
  const selectedKey = selection.kind === 'slot' ? slotKey(selection.slot.date, selection.slot) : null;
  const hasOpenSlot = days.some((entry) => entry.slots.some((slot) => slot.available && slot.remaining > 0));

  let body: React.ReactNode;
  if (slots.loading && !slots.data) {
    body = <LoadingState label={t('grLoadingSlots', 'Checking available times…')} />;
  } else if (slots.error && isNotFound(slots.error)) {
    body = (
      <EmptyState
        icon="calendar"
        title={t('grSlotsUnavailable', 'Scheduling is not available yet')}
        body={t('grSlotsUnavailableBody', 'This store delivers as soon as possible for now.')}
        actionLabel={t('grUseAsap', 'Deliver ASAP')}
        onAction={() => confirm({ kind: 'asap' })}
      />
    );
  } else if (slots.error || !slots.data) {
    body = (
      <ErrorState
        title={t('grSlotsError', "We couldn't load delivery times")}
        body={errorMessage(slots.error, t('grHomeErrorBody', 'Check your connection and try again.'))}
        retryLabel={t('grRetry', 'Try again')}
        onRetry={slots.reload}
      />
    );
  } else if (!asap?.available && !hasOpenSlot) {
    body = (
      <EmptyState
        icon="calendar"
        title={t('grNoSlots', 'No delivery times available')}
        body={t('grNoSlotsBody', 'All slots are full for the next few days. Please try again later.')}
        actionLabel={t('grRetry', 'Try again')}
        onAction={slots.reload}
      />
    );
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {days.map((entry) => (
            <Chip key={entry.date} label={entry.label} selected={entry.date === day?.date} onPress={() => setActiveDate(entry.date)} />
          ))}
        </ScrollView>

        {asap?.available ? (
          <OptionRow
            title={t('grAsap', 'As soon as possible')}
            subtitle={t('grAsapEta', 'About {minutes} min', { minutes: asap.eta_minutes })}
            selected={selection.kind === 'asap'}
            onPress={() => setSelection({ kind: 'asap' })}
            left={<Feather name="zap" size={18} color={theme.colors.primary} />}
          />
        ) : null}

        <SectionHeader title={t('grChooseTime', 'Choose a time')} />
        {day && day.slots.length ? (
          <View style={styles.group}>
            {day.slots.map((slot) => (
              <SlotRow
                key={slotKey(day.date, slot)}
                day={day}
                slot={slot}
                selected={selectedKey === slotKey(day.date, slot)}
                onSelect={() =>
                  setSelection({
                    kind: 'slot',
                    slot: { date: day.date, start: slot.start, end: slot.end, label: `${day.label}, ${slotRange(slot)}` },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
            {t('grNoSlotsDay', 'No delivery windows on this day.')}
          </Text>
        )}
      </ScrollView>
    );
  }

  const canConfirm = !!slots.data && (selection.kind === 'slot' || !!asap?.available);
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('grChooseDeliverySlot', 'Choose Delivery Slot')} onBack={back} />
      {body}
      {slots.data && (asap?.available || hasOpenSlot) ? (
        <View
          style={[
            styles.bar,
            { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
          ]}
        >
          <PrimaryButton title={t('grConfirmSlot', 'Confirm Slot')} disabled={!canConfirm} onPress={() => confirm(selection)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  dates: { gap: 8, paddingRight: 16 },
  group: { gap: 8 },
  disabled: { opacity: 0.55 },
  full: { fontSize: 13, fontWeight: '800' },
  muted: { fontSize: 13 },
  bar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});

export default withVerticalTheme(DeliverySlotContent, () => 'groceries');
