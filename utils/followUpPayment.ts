import { Linking } from 'react-native';
import {
  initializePayment,
  uploadPaymentProof,
  type LocalProofFile,
} from '../services/paymentService';
import type { PaymentInitializeResponse } from '../types/payments';

export function isImmediateCaptureMethod(method: string): boolean {
  return Boolean(method) && method !== 'cash' && method !== 'pay_at_clinic';
}

type FollowUpArgs = {
  token: string;
  amount: number | string;
  method: string;
  phone?: string;
  proof?: LocalProofFile | null;
  serviceType: string;
  objectId?: number;
  currency?: string;
};

export async function followUpPayment(args: FollowUpArgs): Promise<{
  payment: PaymentInitializeResponse | null;
  redirected: boolean;
}> {
  if (!isImmediateCaptureMethod(args.method)) {
    return { payment: null, redirected: false };
  }
  const payment = await initializePayment(args.token, {
    amount: Number(args.amount),
    method: args.method,
    phone: args.phone || undefined,
    service_type: args.serviceType,
    object_id: args.objectId,
    currency: args.currency,
  });
  if (args.proof && payment.requires_action === 'upload_proof' && payment.payment_id) {
    await uploadPaymentProof(args.token, payment.payment_id, args.proof);
  }
  if (payment.authorization_url) {
    await Linking.openURL(payment.authorization_url);
    return { payment, redirected: true };
  }
  return { payment, redirected: false };
}
