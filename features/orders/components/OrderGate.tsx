import React from 'react';
import { View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { OrderDetail } from '../../commerce/api';

type Props = {
  title: string;
  onBack?: () => void;
  order: OrderDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  signedIn: boolean;
  onSignIn: () => void;
  children: (order: OrderDetail) => React.ReactNode;
};

/** Shared signed-out / loading / error / not-found shell for single-order screens. */
export default function OrderGate({ title, onBack, order, loading, error, onRetry, signedIn, onSignIn, children }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  if (order) return <>{children(order)}</>;
  let body: React.ReactNode;
  if (!signedIn) {
    body = (
      <EmptyState
        icon="lock"
        title={t('orSignInTitle', 'Sign in to see your orders')}
        actionLabel={t('orSignIn', 'Sign in')}
        onAction={onSignIn}
      />
    );
  } else if (loading) {
    body = <LoadingState label={t('orLoadingOrder', 'Loading your order…')} />;
  } else if (error) {
    body = (
      <ErrorState
        title={t('orLoadError', 'Something went wrong')}
        body={error}
        retryLabel={t('orRetry', 'Try again')}
        onRetry={onRetry}
      />
    );
  } else {
    body = <EmptyState icon="file-text" title={t('orNotFound', 'Order not found')} />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={title} onBack={onBack} />
      {body}
    </View>
  );
}
