const SYMBOLS: Record<string, string> = {
  ZAR: 'R',
  AOA: 'Kz',
  MZN: 'MT',
  BWP: 'P',
  NAD: 'N$',
  ZMW: 'K',
  USD: '$',
  EUR: '€',
  GBP: '£',
  BRL: 'R$',
  NGN: '₦',
  KES: 'KSh',
};

function groupThousands(value: number): string {
  const [whole, fraction] = Math.abs(value).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}${grouped}.${fraction}`;
}

/** Format an API amount (string or number) in the API-provided currency, e.g. "R 129.99". */
export function formatMoney(amount: string | number | null | undefined, currency?: string | null): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  const code = (currency || 'ZAR').toUpperCase();
  return `${SYMBOLS[code] ?? code} ${groupThousands(value)}`;
}
