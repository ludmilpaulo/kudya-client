import React, { ReactNode } from "react";
import { Text, TextProps, View, StyleSheet, ScrollView } from "react-native";
import * as Sentry from "@sentry/react-native";

const RNText = Text as unknown as React.ComponentType<TextProps>;
const RNView = View as unknown as React.ComponentType<React.ComponentProps<typeof View>>;
const RNScrollView =
  ScrollView as unknown as React.ComponentType<React.ComponentProps<typeof ScrollView>>;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    (this as React.Component<Props, State>).setState({ errorInfo });
    try {
      const transformedErrorInfo = {
        componentStack: errorInfo.componentStack,
      };
      Sentry.captureException(error, { extra: transformedErrorInfo });
    } catch (_) {
      // Sentry may not be inited; don't crash the error UI
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { error, errorInfo } = this.state;
      const message = error?.message ?? "Unknown error";
      const stack = error?.stack ?? "";
      const componentStack = errorInfo?.componentStack ?? "";

      return (
        <RNView style={styles.container}>
          <RNText style={styles.text}>Something went wrong.</RNText>
          {__DEV__ && (
            <RNScrollView style={styles.detailScroll}>
              <RNText style={styles.detailTitle}>Error (dev only):</RNText>
              <RNText style={styles.detail}>{message}</RNText>
              {stack ? (
                <>
                  <RNText style={styles.detailTitle}>Stack:</RNText>
                  <RNText style={styles.detail}>{stack}</RNText>
                </>
              ) : null}
              {componentStack ? (
                <>
                  <RNText style={styles.detailTitle}>Component stack:</RNText>
                  <RNText style={styles.detail}>{componentStack}</RNText>
                </>
              ) : null}
            </RNScrollView>
          )}
        </RNView>
      );
    }

    return (this as React.Component<Props, State>).props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 18,
    color: "red",
  },
  detailScroll: {
    maxHeight: 300,
    width: "100%",
    marginTop: 16,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  detail: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    marginTop: 4,
  },
});

export default ErrorBoundary;
