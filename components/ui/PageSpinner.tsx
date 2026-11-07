import React from "react";
import { ActivityIndicator, View } from "react-native";

type PageSpinnerProps = {
  color?: string;
};

export default function PageSpinner({ color = "#0B8F45" }: PageSpinnerProps) {
  return (
    <View
      accessibilityRole="progressbar"
      style={{ flex: 1, minHeight: 240, alignItems: "center", justifyContent: "center" }}
    >
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}
