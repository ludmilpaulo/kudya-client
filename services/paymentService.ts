import { baseAPI } from "./types";
import type { CurrencyCode, RegionCode } from "../utils/currency";

export interface PaymentInitParams {
  region: RegionCode;
  amount: number;
  email: string;
  currency: CurrencyCode;
}

export interface PaymentInitResult {
  payment_url: string;
  [key: string]: unknown;
}

/**
 * Online card/gateway checkout is not wired for production MVP.
 * Checkout uses COD / pay-on-delivery / TPA only until a real PSP is connected.
 */
export async function fetchPaymentUrl(
  _params: PaymentInitParams,
): Promise<PaymentInitResult> {
  throw new Error(
    "Online payments are not available yet. Please use pay on delivery or TPA.",
  );
}

/** Reserved for future PSP integration against Django. */
export function paymentApiBase(): string {
  return `${baseAPI}/api/payments`;
}
