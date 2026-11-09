import type { TimelineStep } from '../../components/kudya';
import type { OrderDetail, OrderListItem, OrderStatusKey, Vertical } from '../commerce/api';
import { baseAPI } from '../../services/types';
import { ACTIVE_STEP_KEYS, fallbackFoodSteps, isActiveStep, withCancelledStep } from './steps';

export const ACTIVE_STATUSES: readonly OrderStatusKey[] = ACTIVE_STEP_KEYS;

export function isActiveStatus(status: string | null | undefined): boolean {
  return isActiveStep(status);
}

/** "#KD-845763" regardless of whether the API sends "845763", "KD-845763" or "#KD-845763". */
export function orderNumber(order: Pick<OrderListItem, 'id' | 'number'> | { id: number; number?: string | null }): string {
  const raw = (order.number ?? '').trim();
  if (!raw) return `#KD-${order.id}`;
  if (raw.startsWith('#')) return raw;
  if (raw.toUpperCase().startsWith('KD')) return `#${raw}`;
  return `#KD-${raw}`;
}

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** HH:MM in local time, or '' when the timestamp is missing/invalid. */
export function formatClock(iso: string | null | undefined): string {
  const date = parseDate(iso);
  return date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : '';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "14 Apr 2026" */
export function formatDate(iso: string | null | undefined): string {
  const date = parseDate(iso);
  return date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : '';
}

/** "14 Apr 2026, 10:24" */
export function formatDateTime(iso: string | null | undefined): string {
  const day = formatDate(iso);
  const time = formatClock(iso);
  return day && time ? `${day}, ${time}` : day;
}

export function orderVertical(order: { store?: { vertical?: Vertical | null } | null } | null | undefined, fallback?: Vertical): Vertical | undefined {
  return order?.store?.vertical ?? fallback;
}

/**
 * API steps → StatusTimeline steps. Food orders without `steps` get the documented step keys;
 * other orders fall back to the raw timeline. `label` translates a step key (API labels are English).
 */
export function timelineSteps(
  order: OrderDetail,
  describe: (key: string) => string | undefined,
  label?: (key: string) => string | undefined,
): TimelineStep[] {
  const isFood = order.store?.vertical === 'food';
  const source = order.steps?.length ? order.steps : isFood ? fallbackFoodSteps(order.status, order.fulfilment_type) : [];
  if (source.length) {
    const cancelledAt = order.timeline?.find((entry) => entry.status === 'cancelled')?.at ?? null;
    return withCancelledStep(source, order.status, cancelledAt).map((step) => ({
      key: step.key,
      label: label?.(step.key) ?? step.label,
      state: step.state,
      time: formatClock(step.at),
      description: step.state === 'pending' ? undefined : describe(step.key),
    }));
  }
  return (order.timeline ?? []).map((entry, index, all) => ({
    key: `${entry.status}-${index}`,
    label: entry.label,
    state: index === all.length - 1 ? 'active' : 'done',
    time: formatClock(entry.at),
  }));
}

export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const text = value.replace(/_/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseAPI.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

/** Parses "lat,lng" strings used by the order `location` field. */
export function parseLatLng(value: string | null | undefined): { latitude: number; longitude: number } | null {
  if (!value) return null;
  const parts = value.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part))) return null;
  const [latitude, longitude] = parts;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}
