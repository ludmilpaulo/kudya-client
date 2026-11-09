import type { useTranslation } from '../../hooks/useTranslation';

type Translate = ReturnType<typeof useTranslation>['t'];

export const REFUND_REASONS = ['missing_items', 'wrong_items', 'damaged', 'late', 'quality', 'other'] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

export function refundReasonLabel(reason: string, t: Translate): string {
  switch (reason) {
    case 'missing_items':
      return t('orReasonMissing', 'Missing items');
    case 'wrong_items':
      return t('orReasonWrong', 'Wrong items received');
    case 'damaged':
      return t('orReasonDamaged', 'Damaged or spilled items');
    case 'late':
      return t('orReasonLate', 'Order arrived very late');
    case 'quality':
      return t('orReasonQuality', 'Poor quality or not fresh');
    case 'other':
      return t('orReasonOther', 'Something else');
    default:
      return reason.replace(/_/g, ' ');
  }
}

export function refundStatusLabel(status: string, t: Translate): string {
  switch (status) {
    case 'pending':
      return t('orRefundPending', 'Pending');
    case 'approved':
      return t('orRefundApproved', 'Approved');
    case 'rejected':
      return t('orRefundRejected', 'Rejected');
    case 'refunded':
      return t('orRefundRefunded', 'Refunded');
    default:
      return status.replace(/_/g, ' ');
  }
}
