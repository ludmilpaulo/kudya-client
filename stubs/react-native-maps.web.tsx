import React from 'react';
import { View, ViewStyle } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export function Marker({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

type MapViewProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function MapView({ children, style }: MapViewProps) {
  return (
    <View style={[{ backgroundColor: '#e5e7eb', minHeight: 200 }, style]}>
      {children}
    </View>
  );
}
