import { baseAPI } from "./types";
import type { PaymentInitializeResponse, PaymentTransaction } from "../types/payments";

export interface PaymentInitParams {
  amount: number;
  email?: string;
  currency?: string;
  method?: string;
  phone?: string;
  service_type?: string;
  object_id?: number;
  country?: string;
  region?: string;
}

export async function initializePayment(
  token: string,
  params: PaymentInitParams,
): Promise<PaymentInitializeResponse> {
  const response = await fetch(`${baseAPI}/api/payments/initialize/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const body = (await response.json()) as PaymentInitializeResponse & { detail?: string };
  if (!response.ok) {
    throw new Error(body.detail || "Failed to start payment.");
  }
  return body;
}

export async function verifyPayment(
  token: string,
  reference: string,
): Promise<PaymentTransaction> {
  const response = await fetch(`${baseAPI}/api/payments/verify/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ kudya_reference: reference, reference }),
  });
  const body = (await response.json()) as PaymentTransaction & { detail?: string };
  if (!response.ok) {
    throw new Error(body.detail || "Unable to verify payment.");
  }
  return body;
}

export type LocalProofFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadPaymentProof(
  token: string,
  paymentId: number,
  file: LocalProofFile,
): Promise<void> {
  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  const response = await fetch(`${baseAPI}/api/payments/${paymentId}/proof/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    const body = (await response.json()) as { detail?: string };
    throw new Error(body.detail || "Unable to upload proof.");
  }
}
