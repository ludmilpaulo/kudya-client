import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Transform ErrorInfo to a format compatible with Sentry
    const transformedErrorInfo = {
      componentStack: errorInfo.componentStack,
    };

    Sentry.captureException(error, { extra: transformedErrorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "red",
  },
});

export default ErrorBoundary;
