import type { DeliverySlotOption } from '../commerce/api';

/** Accepts "10:00", "10:00:00" or an ISO datetime and returns "HH:MM". */
export function formatSlotTime(value: string): string {
  const time = value.includes('T') ? value.split('T')[1] : value;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value;
}

export function slotRange(slot: Pick<DeliverySlotOption, 'start' | 'end'>): string {
  return `${formatSlotTime(slot.start)} – ${formatSlotTime(slot.end)}`;
}

export function slotKey(date: string, slot: Pick<DeliverySlotOption, 'start' | 'end'>): string {
  return `${date}|${slot.start}|${slot.end}`;
}
