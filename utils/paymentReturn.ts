export function isPaymentReturnUrl(url: string): boolean {
  return url.startsWith('kudya://payment-status') || /\/api\/payments\/return\/[^/?#]+/.test(url);
}
