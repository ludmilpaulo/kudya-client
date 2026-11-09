import type { Feather } from '@expo/vector-icons';
import type React from 'react';
import type { SavedAddress } from '../commerce/api';
import type { DraftAddress } from '../../redux/slices/checkoutDraftSlice';

export const ADDRESS_LABELS = ['Home', 'Work', 'Other'] as const;

type Translate = (key: string, fallback?: string) => string;

/** Localizes the built-in labels; custom labels are shown as typed. */
export function addressLabelText(label: string, t: Translate): string {
  const value = label.trim().toLowerCase();
  if (value === 'home') return t('acLabelHome', 'Home');
  if (value === 'work') return t('acLabelWork', 'Work');
  if (value === 'other') return t('acLabelOther', 'Other');
  return label;
}

export function addressIcon(label: string): React.ComponentProps<typeof Feather>['name'] {
  const value = label.trim().toLowerCase();
  if (value === 'home') return 'home';
  if (value === 'work' || value === 'office') return 'briefcase';
  return 'map-pin';
}

function coord(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toDraftAddress(address: SavedAddress): DraftAddress {
  return {
    id: address.id,
    label: address.label,
    address: address.address,
    latitude: coord(address.latitude),
    longitude: coord(address.longitude),
    instructions: address.instructions ?? '',
  };
}
