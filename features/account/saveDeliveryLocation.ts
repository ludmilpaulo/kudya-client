import { createAddress, fetchAddresses, type SavedAddress } from '../commerce/api';

type Input = { address: string; latitude: number | null; longitude: number | null };

/** Reuses a saved address with the same text, otherwise creates one ("Home" + default when it is the first). */
export async function saveDeliveryLocation(input: Input): Promise<SavedAddress> {
  const existing = await fetchAddresses();
  const normalized = input.address.trim().toLowerCase();
  const match = existing.find((item) => item.address.trim().toLowerCase() === normalized);
  if (match) return match;
  const first = existing.length === 0;
  return createAddress({
    label: first ? 'Home' : 'Other',
    address: input.address.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    is_default: first,
  });
}
