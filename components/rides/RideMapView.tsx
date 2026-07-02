import React, { forwardRef } from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import MapView, { MapViewProps, PROVIDER_GOOGLE } from 'react-native-maps';

type RideMapViewProps = MapViewProps & {
  style?: ViewStyle | ViewStyle[];
};

/**
 * Google Maps on Android needs PROVIDER_GOOGLE and absolute fill dimensions.
 * Render this as the last child in the screen tree so tiles paint correctly on Android.
 */
const RideMapView = forwardRef<MapView, RideMapViewProps>(function RideMapView(
  { style, provider, ...props },
  ref,
) {
  return (
    <MapView
      ref={ref}
      {...props}
      provider={provider ?? (Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined)}
      style={[styles.map, style]}
    />
  );
});

export default RideMapView;

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
