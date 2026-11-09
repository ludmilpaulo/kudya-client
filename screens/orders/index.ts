import { createPlaceholderScreen } from '../../components/kudya/ScreenPlaceholder';

export { default as OrderPlacedScreen } from './OrderPlacedScreen';
export { default as OrderHistoryScreen } from '../OrderHistory';
export const OrderTrackingScreen = createPlaceholderScreen('Order tracking');
export const LiveTrackingScreen = createPlaceholderScreen('Live tracking');
export const OrderChatScreen = createPlaceholderScreen('Chat');
export const OrderDeliveredScreen = createPlaceholderScreen('Delivered');
export const RateOrderScreen = createPlaceholderScreen('Rate your order');
export const OrderReceiptScreen = createPlaceholderScreen('Receipt');
export const RefundsDisputesScreen = createPlaceholderScreen('Refunds & disputes');
export const RefundRequestScreen = createPlaceholderScreen('Request a refund');
