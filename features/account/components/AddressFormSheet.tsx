import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet, Chip, InlineError, PrimaryButton } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { AddressInput, SavedAddress } from '../../commerce/api';
import { ADDRESS_LABELS, addressIcon, addressLabelText } from '../addresses';
import { useCurrentLocation } from '../useCurrentLocation';

type Props = {
  visible: boolean;
  initial: SavedAddress | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AddressInput) => void;
};

function coord(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AddressFormSheet({ visible, initial, saving, error, onClose, onSubmit }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const { locate, locating, error: locationError } = useCurrentLocation();
  const [label, setLabel] = useState<string>('Home');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLabel(initial?.label || 'Home');
    setAddress(initial?.address ?? '');
    setInstructions(initial?.instructions ?? '');
    setCoords({ latitude: coord(initial?.latitude), longitude: coord(initial?.longitude) });
    setLocalError(null);
  }, [initial, visible]);

  const fillFromGps = async () => {
    const result = await locate({
      denied: t('acLocationDenied', 'Location permission was denied. You can enter your address manually.'),
      failed: t('acLocationFailed', 'We could not get your location. Please try again or enter it manually.'),
    });
    if (!result) return;
    setCoords({ latitude: result.latitude, longitude: result.longitude });
    if (!address.trim()) setAddress(result.address);
  };

  const submit = () => {
    if (!address.trim()) {
      setLocalError(t('acAddressRequired', 'Please enter your address.'));
      return;
    }
    setLocalError(null);
    onSubmit({
      label,
      address: address.trim(),
      instructions: instructions.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  const inputStyle = [styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={initial ? t('acEditAddress', 'Edit address') : t('acAddNewAddress', 'Add new address')}
      footer={<PrimaryButton testID="save-address" title={t('acSaveAddress', 'Save address')} loading={saving} onPress={submit} />}
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{t('acLabel', 'Label')}</Text>
        <View style={styles.chips}>
          {ADDRESS_LABELS.map((value) => (
            <Chip key={value} label={addressLabelText(value, t)} icon={addressIcon(value)} selected={label === value} onPress={() => setLabel(value)} />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{t('acAddress', 'Address')}</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder={t('acAddressPlaceholder', 'Street, number, area, city')}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={t('acAddress', 'Address')}
          multiline
          style={[inputStyle, styles.multiline]}
        />
        <PrimaryButton
          title={t('acUseCurrentLocation', 'Use my current location')}
          icon="navigation"
          variant="ghost"
          loading={locating}
          onPress={() => void fillFromGps()}
        />
        {coords.latitude != null && coords.longitude != null ? (
          <Text style={[styles.coords, { color: theme.colors.textMuted }]}>
            {t('acPinnedAt', 'Pinned at {coords}', { coords: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` })}
          </Text>
        ) : null}
        {locationError ? <InlineError message={locationError} /> : null}
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{t('acInstructions', 'Delivery instructions (optional)')}</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder={t('acInstructionsPlaceholder', 'Gate code, floor, landmark…')}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={t('acInstructions', 'Delivery instructions (optional)')}
          style={inputStyle}
        />
        {localError || error ? <InlineError message={(localError || error) as string} /> : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  coords: { fontSize: 12 },
});
