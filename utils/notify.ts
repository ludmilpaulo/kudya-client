import { Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

const isWeb = Platform.OS === 'web';

function browserWindow(): (Window & typeof globalThis) | null {
  return typeof window !== 'undefined' ? window : null;
}

/** Blocking message that also works on react-native-web, where Alert.alert is a no-op. */
export function notify(title: string, message?: string): void {
  if (isWeb) {
    browserWindow()?.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Resolves true when the user confirms. */
export function confirmAction({
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (isWeb) {
    const win = browserWindow();
    return Promise.resolve(win ? win.confirm(message ? `${title}\n\n${message}` : title) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Non-blocking feedback. Requires the global <Toast /> host mounted in AppContent. */
export function toast(type: 'success' | 'error' | 'info', title: string, message?: string): void {
  Toast.show({ type, text1: title, text2: message });
}

/** Best-effort human message from axios / fetch / thrown errors. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data && typeof data === 'object') {
      const body = data as { error?: unknown; detail?: unknown; message?: unknown; errors?: Array<{ error?: string }> };
      if (typeof body.error === 'string' && body.error) return body.error;
      if (typeof body.detail === 'string' && body.detail) return body.detail;
      if (typeof body.message === 'string' && body.message) return body.message;
      if (Array.isArray(body.errors) && body.errors[0]?.error) return body.errors[0].error;
    }
    const code = (error as { code?: string }).code;
    if (code === 'ECONNABORTED') return 'The server took too long to respond. Check your orders before trying again.';
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message && !message.startsWith('Request failed with status code')) {
      return message;
    }
  }
  return fallback;
}
