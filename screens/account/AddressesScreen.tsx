import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenHeader } from '../../components/kudya';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
  type AddressInput,
  type SavedAddress,
} from '../../features/commerce/api';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { selectCheckoutDraft, setDraftAddress } from '../../redux/slices/checkoutDraftSlice';
import { useRequireUser } from '../../features/account/useRequireUser';
import { addressIcon, addressLabelText, toDraftAddress } from '../../features/account/addresses';
import { confirmAction, errorMessage, toast } from '../../utils/notify';
import { useLatestRef } from '../../features/orders/useLatestRef';
import AddressFormSheet from '../../features/account/components/AddressFormSheet';

type RowProps = {
  item: SavedAddress;
  selectMode: boolean;
  selected: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMakeDefault: () => void;
};

function AddressRow({ item, selectMode, selected, onPress, onEdit, onDelete, onMakeDefault }: RowProps) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={selectMode ? 'radio' : 'button'}
      accessibilityState={selectMode ? { selected } : undefined}
      accessibilityLabel={`${item.label}, ${item.address}`}
      style={[
        styles.row,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name={addressIcon(item.label)} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{addressLabelText(item.label, t)}</Text>
          {item.is_default ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.successSoft }]}>
              <Text style={[styles.badgeText, { color: theme.colors.success }]}>{t('acDefault', 'Default')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.address, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {item.address}
        </Text>
        {item.instructions ? (
          <Text style={[styles.instructions, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {item.instructions}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {!item.is_default ? (
            <Pressable onPress={onMakeDefault} hitSlop={6} accessibilityRole="button">
              <Text style={[styles.action, { color: theme.colors.primary }]}>{t('acSetDefault', 'Set as default')}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onEdit} hitSlop={6} accessibilityRole="button" accessibilityLabel={t('acEditAddress', 'Edit address')}>
            <Text style={[styles.action, { color: theme.colors.primary }]}>{t('acEdit', 'Edit')}</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={6} accessibilityRole="button" accessibilityLabel={t('acDeleteAddress', 'Delete address')}>
            <Text style={[styles.action, { color: theme.colors.error }]}>{t('acDelete', 'Delete')}</Text>
          </Pressable>
        </View>
      </View>
      {selectMode ? (
        <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
          {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function AddressesContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { params } = useAppRoute<'Addresses'>();
  const selectMode = !!params?.selectMode;
  const draft = useAppSelector(selectCheckoutDraft).address;
  const { signedIn } = useRequireUser();
  const [items, setItems] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const tRef = useLatestRef(t);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode !== 'silent') setError(null);
      try {
        setItems(await fetchAddresses());
      } catch (err) {
        setError(errorMessage(err, tRef.current('acAddressesLoadFailed', 'We could not load your addresses.')));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tRef],
  );

  useFocusEffect(
    useCallback(() => {
      if (signedIn) void load('initial');
      else setLoading(false);
    }, [load, signedIn]),
  );

  const choose = (item: SavedAddress) => {
    if (!selectMode) {
      setEditing(item);
      setSheetOpen(true);
      return;
    }
    dispatch(setDraftAddress(toDraftAddress(item)));
    navigation.goBack();
  };

  const remove = async (item: SavedAddress) => {
    const ok = await confirmAction({
      title: t('acDeleteAddressTitle', 'Delete this address?'),
      message: item.address,
      confirmText: t('acDelete', 'Delete'),
      cancelText: t('acCancel', 'Cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteAddress(item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (draft?.id === item.id) dispatch(setDraftAddress(null));
      toast('success', t('acAddressDeleted', 'Address deleted'));
    } catch (err) {
      toast('error', t('acDeleteFailed', 'Could not delete address'), errorMessage(err, ''));
    }
  };

  const makeDefault = async (item: SavedAddress) => {
    try {
      await setDefaultAddress(item.id);
      setItems((prev) => prev.map((entry) => ({ ...entry, is_default: entry.id === item.id })));
    } catch (err) {
      toast('error', t('acDefaultFailed', 'Could not set default address'), errorMessage(err, ''));
    }
  };

  const save = async (input: AddressInput) => {
    setSaving(true);
    setSaveError(null);
    try {
      const saved = editing ? await updateAddress(editing.id, input) : await createAddress({ ...input, is_default: items.length === 0 });
      setSheetOpen(false);
      setEditing(null);
      toast('success', t('acAddressSaved', 'Address saved'));
      if (selectMode && !editing) {
        dispatch(setDraftAddress(toDraftAddress(saved)));
        navigation.goBack();
        return;
      }
      if (draft?.id === saved.id) dispatch(setDraftAddress(toDraftAddress(saved)));
      void load('silent');
    } catch (err) {
      setSaveError(errorMessage(err, t('acAddressSaveFailed', 'We could not save it to your addresses.')));
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setSaveError(null);
    setSheetOpen(true);
  };

  let body: React.ReactNode;
  if (!signedIn) {
    body = <EmptyState icon="lock" title={t('acSignInAddresses', 'Sign in to manage your addresses')} actionLabel={t('acSignIn', 'Sign in')} onAction={() => navigation.navigate('UserLogin')} />;
  } else if (loading) {
    body = <LoadingState />;
  } else if (error && !items.length) {
    body = <ErrorState title={t('acSomethingWrong', 'Something went wrong')} body={error} retryLabel={t('acRetry', 'Try again')} onRetry={() => void load('initial')} />;
  } else if (!items.length) {
    body = (
      <EmptyState
        icon="map-pin"
        title={t('acNoAddresses', 'No saved addresses')}
        body={t('acNoAddressesBody', 'Add your home or work address for faster checkout.')}
        actionLabel={t('acAddNewAddress', 'Add new address')}
        onAction={openNew}
      />
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={theme.colors.primary} />}
        renderItem={({ item }) => (
          <AddressRow
            item={item}
            selectMode={selectMode}
            selected={selectMode && draft?.id === item.id}
            onPress={() => choose(item)}
            onEdit={() => {
              setEditing(item);
              setSaveError(null);
              setSheetOpen(true);
            }}
            onDelete={() => void remove(item)}
            onMakeDefault={() => void makeDefault(item)}
          />
        )}
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={selectMode ? t('acDeliveryAddress', 'Delivery address') : t('acMyAddresses', 'My addresses')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.flex}>{body}</View>
      {signedIn && items.length ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <PrimaryButton testID="add-address" title={t('acAddNewAddress', 'Add new address')} icon="plus" variant="outline" onPress={openNew} />
        </View>
      ) : null}
      <AddressFormSheet
        visible={sheetOpen}
        initial={editing}
        saving={saving}
        error={saveError}
        onClose={() => setSheetOpen(false)}
        onSubmit={(input) => void save(input)}
      />
    </View>
  );
}

export default function AddressesScreen() {
  const { params } = useAppRoute<'Addresses'>();
  return (
    <VerticalThemeProvider vertical={params?.vertical}>
      <AddressesContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontWeight: '800' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  address: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  instructions: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  action: { fontSize: 13, fontWeight: '800' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
