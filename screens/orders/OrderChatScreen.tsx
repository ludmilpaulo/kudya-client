import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Chip, EmptyState, ErrorState, LoadingState, ScreenHeader } from '../../components/kudya';
import type { OrderChatMessage, OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { useOrderChat } from '../../features/orders/useOrderChat';
import { formatClock, orderNumber, orderVertical } from '../../features/orders/format';
import { callPhone } from '../../features/orders/links';
import { toast } from '../../utils/notify';
import OrderGate from '../../features/orders/components/OrderGate';
import RoundIconButton from '../../features/orders/components/RoundIconButton';

type Chat = ReturnType<typeof useOrderChat>;

function Bubble({ message, senderLabel }: { message: OrderChatMessage; senderLabel: string }) {
  const theme = useVerticalTheme();
  const mine = message.sender === 'customer';
  return (
    <View style={[styles.bubbleRow, mine ? styles.mineRow : styles.theirRow]}>
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
        ]}
        accessibilityLabel={`${senderLabel}: ${message.text}`}
      >
        {!mine ? <Text style={[styles.sender, { color: theme.colors.primary }]}>{senderLabel}</Text> : null}
        <Text style={[styles.text, { color: mine ? theme.colors.onPrimary : theme.colors.text }]}>{message.text}</Text>
        <Text style={[styles.time, { color: mine ? 'rgba(255,255,255,0.75)' : theme.colors.textMuted }]}>
          {formatClock(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

function ChatBody({ order, chat }: { order: OrderDetail; chat: Chat }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<OrderChatMessage>>(null);
  const quickReplies = [
    t('orQuickOnMyWay', "I'm on my way down"),
    t('orQuickAtGate', "I'm at the gate"),
    t('orQuickCallMe', 'Please call me'),
    t('orQuickThanks', 'Great, thank you!'),
  ];

  const senderLabel = (message: OrderChatMessage) =>
    message.sender === 'driver'
      ? order.driver?.name ?? t('orYourCourier', 'Your courier')
      : message.sender === 'store'
        ? order.store.name
        : t('orYou', 'You');

  const submit = async (text: string) => {
    const ok = await chat.send(text);
    if (ok) setDraft('');
    else toast('error', t('orSendFailed', 'Message not sent'), t('orTryAgainLater', 'Please try again later.'));
  };

  let content: React.ReactNode;
  if (!order.chat_enabled) {
    content = <EmptyState icon="message-circle" title={t('orChatUnavailable', 'Chat is not available for this order')} />;
  } else if (chat.loading && !chat.messages.length) {
    content = <LoadingState />;
  } else if (chat.error && !chat.messages.length) {
    content = <ErrorState title={t('orLoadError', 'Something went wrong')} body={chat.error} retryLabel={t('orRetry', 'Try again')} onRetry={chat.reload} />;
  } else if (!chat.messages.length) {
    content = (
      <EmptyState
        icon="message-circle"
        title={t('orChatEmpty', 'No messages yet')}
        body={t('orChatEmptyBody', 'Send a message to your courier about your delivery.')}
      />
    );
  } else {
    content = (
      <FlatList
        ref={listRef}
        data={chat.messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Bubble message={item} senderLabel={senderLabel(item)} />}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={order.driver?.name ?? t('orChat', 'Chat')}
        subtitle={orderNumber(order)}
        onBack={() => navigation.goBack()}
        right={
          order.driver?.phone ? (
            <RoundIconButton
              icon="phone"
              size={38}
              label={t('orCallDriver', 'Call driver')}
              onPress={() => callPhone(order.driver?.phone, t('orCallFailed', 'Could not start the call'))}
            />
          ) : undefined
        }
      />
      <View style={styles.flex}>{content}</View>
      {order.chat_enabled ? (
        <View style={[styles.composer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: insets.bottom + 10 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick}>
            {quickReplies.map((reply) => (
              <Chip key={reply} label={reply} onPress={() => void submit(reply)} />
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('orTypeMessage', 'Type a message…')}
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel={t('orTypeMessage', 'Type a message…')}
              style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onSubmitEditing={() => void submit(draft)}
              returnKeyType="send"
              multiline={false}
            />
            <RoundIconButton
              icon="send"
              solid
              label={t('orSend', 'Send')}
              disabled={!draft.trim() || chat.sending}
              onPress={() => void submit(draft)}
            />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

export default function OrderChatScreen() {
  const { params } = useAppRoute<'OrderChat'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const receiveRef = useRef<((message: OrderChatMessage) => void) | null>(null);
  const onChatMessage = useCallback((message: OrderChatMessage) => receiveRef.current?.(message), []);
  const live = useOrderLive(params.orderId, { token, live: signedIn, onChatMessage });
  const chat = useOrderChat(params.orderId, { enabled: signedIn, connected: live.connected });

  useEffect(() => {
    receiveRef.current = chat.receive;
  }, [chat.receive]);

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orChat', 'Chat')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <ChatBody order={order} chat={chat} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 8 },
  bubbleRow: { flexDirection: 'row' },
  mineRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  sender: { fontSize: 11, fontWeight: '800', marginBottom: 2 },
  text: { fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 3, alignSelf: 'flex-end' },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 10 },
  quick: { paddingHorizontal: 12, gap: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  input: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
});
