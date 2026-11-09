import type { CheckoutLine } from '../marketplace/api/checkoutApi';

/** Mirrors `MAX_LINE_INSTRUCTIONS` in the backend checkout service. */
export const MAX_SPECIAL_INSTRUCTIONS = 300;

export type KeyedCartLine = {
  id: number;
  quantity: number;
  addons?: Array<{ id: number }>;
  special_instructions?: string;
  line_key?: string;
};

export function normalizeInstructions(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_SPECIAL_INSTRUCTIONS);
}

function sortedAddonIds(addonIds: number[]): number[] {
  return Array.from(new Set(addonIds)).sort((a, b) => a - b);
}

/** djb2; only used to keep line keys short (the server truncates keys at 120 chars). */
function shortHash(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/** Same product + same add-ons + same instructions → same key; anything else is a separate cart line. */
export function cartLineKey(productId: number, addonIds: number[] = [], specialInstructions?: string | null): string {
  const addons = sortedAddonIds(addonIds);
  const note = normalizeInstructions(specialInstructions);
  return [`p${productId}`, addons.length ? `a${addons.join('.')}` : '', note ? `n${shortHash(note)}` : '']
    .filter(Boolean)
    .join('-');
}

export function lineKeyFor(item: KeyedCartLine): string {
  return (
    item.line_key ||
    cartLineKey(
      item.id,
      (item.addons ?? []).map((addon) => addon.id),
      item.special_instructions,
    )
  );
}

/**
 * Quote/checkout lines carry only ids, quantities, add-on ids and instructions — never prices.
 * Rows with the same key are merged so the server sees one line per configuration.
 */
export function quoteLines(items: KeyedCartLine[]): CheckoutLine[] {
  const merged = new Map<string, CheckoutLine>();
  for (const item of items) {
    const key = lineKeyFor(item);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Number((existing.quantity + item.quantity).toFixed(3));
      continue;
    }
    const addons = sortedAddonIds((item.addons ?? []).map((addon) => addon.id));
    const note = normalizeInstructions(item.special_instructions);
    merged.set(key, {
      key,
      product_id: item.id,
      quantity: item.quantity,
      ...(addons.length ? { addons } : {}),
      ...(note ? { special_instructions: note } : {}),
    });
  }
  return Array.from(merged.values());
}

/** Stable string for "has the cart changed?" checks (idempotency key rotation). */
export function cartSignature(lines: CheckoutLine[]): string {
  return lines
    .map((line) => `${line.key ?? line.product_id}x${line.quantity}`)
    .sort()
    .join('|');
}

/** RFC 4122 v4 UUID; uses the platform CSPRNG when available. */
export function newIdempotencyKey(): string {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string; getRandomValues?: (array: Uint8Array) => Uint8Array } })
    .crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
