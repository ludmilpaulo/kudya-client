import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, ErrorState, InlineError, LoadingState, PrimaryButton, ScreenHeader } from '../../components/kudya';
import { sendEmailOtp, verifyEmailOtp } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { apiErrorInfo } from '../../features/account/apiError';
import { goBackOr, goHome } from '../../features/orders/navigation';
import { toast } from '../../utils/notify';
import { useLatestRef } from '../../features/orders/useLatestRef';
import OtpCodeInput from '../../features/account/components/OtpCodeInput';

const CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;

type Phase = 'sending' | 'code' | 'already-verified' | 'send-failed';

function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return [seconds, setSeconds] as const;
}

function OtpContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useAppRoute<'OtpVerification'>();
  const { signedIn } = useRequireUser();
  const [phase, setPhase] = useState<Phase>('sending');
  const [email, setEmail] = useState(params?.email ?? '');
  const [code, setCode] = useState('');
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useCountdown();
  const sentOnce = useRef(false);
  const tRef = useLatestRef(t);

  const leave = useCallback(() => goBackOr(navigation, () => goHome(navigation)), [navigation]);

  const send = useCallback(
    async (initial: boolean) => {
      const t = tRef.current;
      if (initial) setPhase('sending');
      else setResending(true);
      setError(null);
      setSendError(null);
      try {
        const result = await sendEmailOtp();
        if (result.email) setEmail(result.email);
        if (result.verified) {
          setPhase('already-verified');
          return;
        }
        setDebugCode(__DEV__ && result.debug_code ? result.debug_code : null);
        setResendIn(result.resend_in ?? DEFAULT_RESEND_SECONDS);
        setCode('');
        setPhase('code');
        if (!initial) toast('success', t('acCodeResent', 'A new code is on its way'));
      } catch (err) {
        const info = apiErrorInfo(err);
        if (info.status === 429) {
          // Cooldown: a code was already sent recently, so let the user type it.
          setResendIn(info.retryIn ?? DEFAULT_RESEND_SECONDS);
          setPhase('code');
          setError(info.detail ?? t('acWaitBeforeResend', 'Please wait before requesting another code.'));
          return;
        }
        const message =
          info.status === 503
            ? t('acEmailSendFailed', 'We could not send the email right now. Please try again shortly.')
            : info.detail ?? t('acCodeSendFailed', 'We could not send a verification code.');
        if (initial) {
          setSendError(message);
          setPhase('send-failed');
        } else {
          setError(message);
        }
      } finally {
        setResending(false);
      }
    },
    [setResendIn, tRef],
  );

  useEffect(() => {
    if (!signedIn || sentOnce.current) return;
    sentOnce.current = true;
    void send(true);
  }, [send, signedIn]);

  const verify = async (value: string = code) => {
    if (value.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyEmailOtp(value);
      if (!result.verified) {
        setError(t('acInvalidCode', 'Invalid code.'));
        return;
      }
      toast('success', t('acEmailVerified', 'Email verified'), result.email || email);
      leave();
    } catch (err) {
      const info = apiErrorInfo(err);
      let message = info.detail ?? t('acVerifyFailed', 'We could not verify the code.');
      if (info.attemptsLeft != null) {
        message = `${message} ${t('acAttemptsLeft', '{count} attempts left.', { count: info.attemptsLeft })}`;
      }
      if (info.status === 429) message = info.detail ?? t('acTooManyAttempts', 'Too many attempts. Request a new code.');
      setError(message);
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  let body: React.ReactNode;
  if (!signedIn) {
    body = (
      <EmptyState
        icon="lock"
        title={t('acSignInToVerify', 'Sign in to verify your email')}
        actionLabel={t('acSignIn', 'Sign in')}
        onAction={() => navigation.navigate('UserLogin')}
      />
    );
  } else if (phase === 'sending') {
    body = <LoadingState label={t('acSendingCode', 'Sending your code…')} />;
  } else if (phase === 'send-failed') {
    body = (
      <ErrorState
        title={t('acSomethingWrong', 'Something went wrong')}
        body={sendError ?? undefined}
        retryLabel={t('acRetry', 'Try again')}
        onRetry={() => void send(true)}
      />
    );
  } else if (phase === 'already-verified') {
    body = (
      <View style={styles.center}>
        <View style={[styles.badge, { backgroundColor: theme.colors.successSoft }]}>
          <Feather name="check-circle" size={44} color={theme.colors.success} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('acAlreadyVerified', 'Your email is already verified')}</Text>
        {email ? <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{email}</Text> : null}
        <PrimaryButton title={t('acDone', 'Done')} onPress={leave} style={styles.stretch} />
      </View>
    );
  } else {
    body = (
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
          <Feather name="mail" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('acVerifyYourEmail', 'Verify your email')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {t('acEnterCodeSentTo', 'Enter the 6-digit code sent to {email}', { email: email || t('acYourEmail', 'your email') })}
        </Text>
        <OtpCodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) setError(null);
          }}
          onComplete={(value) => void verify(value)}
          hasError={!!error}
          accessibilityLabel={t('acVerificationCode', 'Verification code')}
        />
        {debugCode ? (
          <Text style={[styles.debug, { color: theme.colors.warning }]} testID="otp-debug-code">
            {t('acDebugCode', 'Dev code: {code}', { code: debugCode })}
          </Text>
        ) : null}
        {error ? <InlineError message={error} /> : null}
        <PrimaryButton
          testID="verify-email"
          title={t('acVerify', 'Verify')}
          disabled={code.length !== CODE_LENGTH}
          loading={verifying}
          onPress={() => void verify()}
        />
        <View style={styles.resendRow}>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('acNoCode', "Didn't get the code?")}</Text>
          {resendIn > 0 ? (
            <Text style={[styles.resend, { color: theme.colors.textMuted }]}>
              {t('acResendIn', 'Resend in {seconds}s', { seconds: resendIn })}
            </Text>
          ) : (
            <Pressable
              onPress={resending ? undefined : () => void send(false)}
              accessibilityRole="button"
              accessibilityState={{ busy: resending }}
              hitSlop={8}
            >
              <Text style={[styles.resend, { color: theme.colors.primary }]}>
                {resending ? t('acSending', 'Sending…') : t('acResendCode', 'Resend code')}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('acVerifyYourAccount', 'Verify Your Account')} onBack={leave} />
      {body}
    </KeyboardAvoidingView>
  );
}

export default function OtpVerificationScreen() {
  return (
    <VerticalThemeProvider vertical={undefined}>
      <OtpContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 18, alignItems: 'stretch' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  stretch: { alignSelf: 'stretch', marginTop: 8 },
  badge: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  debug: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  resend: { fontSize: 14, fontWeight: '800' },
});
