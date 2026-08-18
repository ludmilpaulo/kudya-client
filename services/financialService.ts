import axios from 'axios';
import { baseAPI } from './types';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getFinancialAccount(currency: string | undefined, token: string) {
  const { data } = await axios.get(`${baseAPI}/api/v1/financial/accounts/me/`, {
    headers: authHeaders(token),
    params: currency ? { currency } : undefined,
  });
  return data;
}

export async function createTransfer(
  payload: {
    amount: number;
    currency: string;
    recipient_phone?: string;
    pin?: string;
    idempotency_key?: string;
  },
  token: string,
) {
  const { data } = await axios.post(`${baseAPI}/api/v1/financial/transfers/`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function createWithdrawal(
  payload: {
    amount: number;
    currency: string;
    method: string;
    payout_details: Record<string, unknown>;
    pin: string;
    idempotency_key?: string;
  },
  token: string,
) {
  const { data } = await axios.post(`${baseAPI}/api/v1/financial/withdrawals/`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function setWalletPin(pin: string, token: string) {
  const { data } = await axios.post(`${baseAPI}/api/v1/financial/pin/set/`, { pin }, {
    headers: authHeaders(token),
  });
  return data;
}

export async function getRemittanceCorridors(token: string) {
  const { data } = await axios.get(`${baseAPI}/api/v1/financial/remittances/corridors/`, {
    headers: authHeaders(token),
  });
  return data;
}

export async function createVasPurchase(
  payload: {
    service_type: string;
    amount: number;
    currency: string;
    country_code: string;
    recipient?: string;
    pin?: string;
  },
  token: string,
) {
  const { data } = await axios.post(`${baseAPI}/api/v1/financial/vas/`, payload, {
    headers: authHeaders(token),
  });
  return data;
}
