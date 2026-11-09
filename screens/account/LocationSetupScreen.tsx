import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, InlineError, PrimaryButton, ScreenHeader, SearchBar } from '../../components/kudya';
import { useAppDispatch } from '../../redux/store';
import { setDraftAddress } from '../../redux/slices/checkoutDraftSlice';
import { useRequireUser } from '../../features/account/useRequireUser';
import { geocodeAddress, useCurrentLocation } from '../../features/account/useCurrentLocation';
import { saveDeliveryLocation } from '../../features/account/saveDeliveryLocation';
import { goBackOr, goHome } from '../../features/orders/navigation';
import { errorMessage, toast } from '../../utils/notify';

type Picked = { address: string; latitude: number | null; longitude: number | null };

function LocationContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'LocationSetup'>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { signedIn } = useRequireUser({ redirect: false });
  const { locate, locating, error: locationError } = useCurrentLocation();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickCurrent = async () => {
    setError(null);
    const result = await locate({
      denied: t('acLocationDenied', 'Location permission was denied. You can enter your address manually.'),
      failed: t('acLocationFailed', 'We could not get your location. Please try again or enter it manually.'),
    });
    if (result) setPicked(result);
  };

  const search = async () => {
    const text = query.trim();
    if (!text) return;
    setSearching(true);
    setError(null);
    const coords = await geocodeAddress(text);
    setSearching(false);
    setPicked({ address: text, latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null });
  };

  const finish = () => {
    const next = params?.next;
    if (next === 'MainTabs') navigation.navigate('MainTabs');
    else if (next) navigation.replace(next);
    else goBackOr(navigation, () => goHome(navigation));
  };

  const confirm = async () => {
    if (!picked || !picked.address.trim()) {
      setError(t('acAddressRequired', 'Please enter your address.'));
      return;
    }
    setSaving(true);
    setError(null);
    const draft = { id: null, label: 'Home', address: picked.address.trim(), latitude: picked.latitude, longitude: picked.longitude, instructions: '' };
    try {
      if (signedIn) {
        const saved = await saveDeliveryLocation(picked);
        dispatch(setDraftAddress({ ...draft, id: saved.id, label: saved.label, instructions: saved.instructions ?? '' }));
      } else {
        dispatch(setDraftAddress(draft));
      }
      toast('success', t('acLocationSaved', 'Delivery location set'));
      finish();
    } catch (err) {
      dispatch(setDraftAddress(draft));
      toast('info', t('acLocationNotSaved', 'Location set for this order'), errorMessage(err, t('acAddressSaveFailed', 'We could not save it to your addresses.')));
      finish();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('acYourLocation', 'Your location')} onBack={() => goBackOr(navigation, () => goHome(navigation))} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: theme.colors.primarySoft }]}>
          <View style={[styles.heroPin, { backgroundColor: theme.colors.primary }]}>
            <Feather name="map-pin" size={36} color={theme.colors.onPrimary} />
          </View>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('acWhereAreYou', 'Where are you?')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {theme.key === 'groceries'
            ? t('acShareLocationGrocery', 'Share your location to find grocery stores near you and get accurate delivery times.')
            : t('acShareLocationFood', 'Set your location to find restaurants near you.')}
        </Text>

        <PrimaryButton
          testID="use-current-location"
          title={t('acUseCurrentLocation', 'Use my current location')}
          icon="navigation"
          loading={locating}
          onPress={() => void pickCurrent()}
        />
        {locationError ? <InlineError message={locationError} /> : null}

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('acSearchLocation', 'Search for a location')}
          onSubmit={() => void search()}
        />
        {query.trim() ? (
          <PrimaryButton title={t('acSearch', 'Search')} icon="search" variant="outline" loading={searching} onPress={() => void search()} />
        ) : null}
        <PrimaryButton
          title={t('acEnterManually', 'Enter address manually')}
          icon="edit-3"
          variant="ghost"
          onPress={() => setPicked((prev) => prev ?? { address: '', latitude: null, longitude: null })}
        />

        {picked ? (
          <Card style={styles.confirm}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>{t('acDeliveryAddress', 'Delivery address')}</Text>
            <TextInput
              value={picked.address}
              onChangeText={(address) => setPicked((prev) => (prev ? { ...prev, address } : prev))}
              placeholder={t('acAddressPlaceholder', 'Street, number, area, city')}
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel={t('acDeliveryAddress', 'Delivery address')}
              multiline
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            />
            {picked.latitude != null && picked.longitude != null ? (
              <Text style={[styles.coords, { color: theme.colors.textMuted }]}>
                <Feather name="crosshair" size={12} /> {picked.latitude.toFixed(5)}, {picked.longitude.toFixed(5)}
              </Text>
            ) : null}
            {error ? <InlineError message={error} /> : null}
            <PrimaryButton testID="confirm-location" title={t('acConfirmLocation', 'Confirm Location')} loading={saving} onPress={() => void confirm()} />
          </Card>
        ) : null}

        {!picked ? (
          <PrimaryButton title={t('acNotNow', 'Not now')} variant="ghost" onPress={finish} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function LocationSetupScreen() {
  const { params } = useAppRoute<'LocationSetup'>();
  return (
    <VerticalThemeProvider vertical={params?.vertical}>
      <LocationContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 14 },
  hero: { alignSelf: 'center', width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  heroPin: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 6 },
  confirm: { gap: 10 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  input: { minHeight: 56, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: 'top' },
  coords: { fontSize: 12 },
});
