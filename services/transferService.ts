import { baseAPI } from './types';
import type { TransferRequirements } from '../utils/transferFields';

export type TransferDestination = {
  payer_id: string;
  name: string;
  country: string;
  currency: string;
  min_amount: string | null;
  max_amount: string | null;
  required_fields: TransferRequirements;
};

export type TransferQuote = {
  id: number;
  source_amount: string;
  source_currency: string;
  destination_amount: string;
  destination_currency: string;
  fee: string;
  total_debit: string;
  fx_rate: string;
  expires_at: string;
  required_fields: TransferRequirements;
};

export type TransferVerification = {
  verified: boolean;
  verification_available: boolean;
  warning: string;
};

export type MoneyTransferRow = {
  id: number;
  status_class: string;
  beneficiary_received: boolean;
  reversed_to_wallet: boolean;
  open_rfi: boolean;
  amount: string;
  currency: string;
  destination_amount: string;
  destination_currency: string;
  created_at: string;
};

type Beneficiary = Record<string, Record<string, string>>;

async function call<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseAPI}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const body = (await response.json().catch(() => ({}))) as T & { detail?: string };
  if (!response.ok) throw new Error(body.detail || 'Request failed.');
  return body;
}

export async function fetchTransferDestinations(token: string): Promise<TransferDestination[]> {
  return (await call<{ destinations: TransferDestination[] }>(token, '/api/payments/transfers/destinations/')).destinations;
}

export async function fetchTransfers(token: string): Promise<MoneyTransferRow[]> {
  return (await call<{ transfers: MoneyTransferRow[] }>(token, '/api/payments/transfers/')).transfers;
}

export function fetchTransfer(token: string, id: number): Promise<MoneyTransferRow> {
  return call<MoneyTransferRow>(token, `/api/payments/transfers/${id}/`);
}

export function requestTransferQuote(
  token: string,
  body: { payer_id: string; amount: string; currency: string; destination_currency: string },
): Promise<TransferQuote> {
  return call<TransferQuote>(token, '/api/payments/transfers/quotes/', { method: 'POST', body: JSON.stringify(body) });
}

export function verifyTransferBeneficiary(token: string, payerId: string, beneficiary: Beneficiary): Promise<TransferVerification> {
  return call<TransferVerification>(token, '/api/payments/transfers/verify/', {
    method: 'POST',
    body: JSON.stringify({ payer_id: payerId, beneficiary }),
  });
}

export function sendMoneyTransfer(
  token: string,
  body: { quote_id: number; beneficiary: Beneficiary; pin: string; confirmed: true },
  idempotencyKey: string,
): Promise<MoneyTransferRow> {
  return call<MoneyTransferRow>(token, '/api/payments/transfers/', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}
