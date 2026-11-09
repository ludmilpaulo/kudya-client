import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, Chip, EmptyState, ScreenHeader } from '../../components/kudya';
import { localeLabels } from '../../configs/i18n';
import { useAppDispatch } from '../../redux/store';
import { logoutUser } from '../../redux/slices/authSlice';
import { useRequireUser } from '../../features/account/useRequireUser';
import { goBackOr, goHome, goToSupport } from '../../features/orders/navigation';
import { confirmAction } from '../../utils/notify';
import SettingsRow from '../../features/account/components/SettingsRow';

function ProfileHeader({ name, subtitle }: { name: string; subtitle: string }) {
  const theme = useVerticalTheme();
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.profile, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.avatar}>
        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials || '?'}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.name, { color: theme.colors.onPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function LanguageSection() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const { languageCode, setLanguage, supportedLocales } = useLanguage();
  return (
    <Card style={styles.language}>
      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{t('acLanguage', 'Language')}</Text>
      <View style={styles.chips}>
        {supportedLocales.map((code) => (
          <Chip key={code} label={localeLabels[code]} selected={languageCode === code} onPress={() => void setLanguage(code)} />
        ))}
      </View>
    </Card>
  );
}

function SettingsContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user } = useRequireUser();

  const logout = async () => {
    const ok = await confirmAction({
      title: t('acLogoutTitle', 'Log out?'),
      message: t('acLogoutBody', 'You will need to sign in again to place orders.'),
      confirmText: t('acLogout', 'Log Out'),
      cancelText: t('acCancel', 'Cancel'),
      destructive: true,
    });
    if (!ok) return;
    dispatch(logoutUser());
    goHome(navigation);
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('acMyAccount', 'My Account')} onBack={() => goBackOr(navigation, () => goHome(navigation))} />
      {!user ? (
        <EmptyState
          icon="user"
          title={t('acSignInAccount', 'Sign in to manage your account')}
          actionLabel={t('acSignIn', 'Sign in')}
          onAction={() => navigation.navigate('UserLogin')}
        />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <ProfileHeader name={user.username} subtitle={t('acKudyaMember', 'Kudya member')} />

          <Card style={styles.group}>
            <SettingsRow icon="shopping-bag" title={t('acMyOrders', 'My Orders')} onPress={() => navigation.navigate('OrderHistory')} testID="settings-orders" />
            <SettingsRow icon="map-pin" title={t('acAddresses', 'Addresses')} onPress={() => navigation.navigate('Addresses')} />
            <SettingsRow icon="credit-card" title={t('acPaymentMethods', 'Payment methods')} onPress={() => navigation.navigate('Wallet')} />
            <SettingsRow icon="briefcase" title={t('acKudyaWallet', 'Kudya Wallet')} onPress={() => navigation.navigate('Wallet')} />
            <SettingsRow icon="tag" title={t('acCoupons', 'Coupons & offers')} onPress={() => navigation.navigate('Coupons')} />
            <SettingsRow icon="rotate-ccw" title={t('acRefunds', 'Refunds & disputes')} onPress={() => navigation.navigate('RefundsDisputes')} last />
          </Card>

          <Card style={styles.group}>
            <SettingsRow icon="bell" title={t('acNotifications', 'Notifications')} onPress={() => navigation.navigate('Notifications')} />
            <SettingsRow icon="mail" title={t('acVerifyEmail', 'Verify email')} onPress={() => navigation.navigate('OtpVerification')} testID="settings-verify-email" />
            <SettingsRow icon="help-circle" title={t('acHelpSupport', 'Help & Support')} onPress={() => goToSupport(navigation)} last />
          </Card>

          <LanguageSection />

          <Card style={styles.group}>
            <SettingsRow icon="log-out" title={t('acLogout', 'Log Out')} onPress={() => void logout()} danger last testID="settings-logout" />
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <VerticalThemeProvider vertical={undefined}>
      <SettingsContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900' },
  name: { fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  group: { padding: 0, overflow: 'hidden' },
  language: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
