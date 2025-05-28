import type { CurrencyCode, RegionCode } from "../utils/currency";

export interface PaymentInitParams {
  region: RegionCode;
  amount: number;
  email: string;
  currency: CurrencyCode;
}

export interface PaymentInitResult {
  payment_url: string;
  [key: string]: any;
}

export async function fetchPaymentUrl(params: PaymentInitParams): Promise<PaymentInitResult> {
  // For demo, all regions POST to this endpoint. Customize per region if needed.
  const res = await fetch("https://your-backend/api/pay/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.paymentUrl) throw new Error(data.message || "Could not initiate payment");
  return { payment_url: data.paymentUrl };
}
