import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';

type LatLng = { latitude: number; longitude: number };

type Props = {
  driver: LatLng | null;
  destination: LatLng | null;
  etaMinutes: number | null;
  height?: number;
};

function formatCoord(point: LatLng): string {
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}

/** react-native-maps resolves to a blank stub on web, so web gets a styled summary card instead. */
function WebFallback({ driver, destination, etaMinutes, height }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.fallback, { height, backgroundColor: theme.colors.primarySoft }]} accessibilityRole="summary">
      <View style={[styles.fallbackRoute, { borderColor: theme.colors.primary }]} />
      <View style={styles.fallbackRow}>
        <View style={[styles.pin, { backgroundColor: theme.colors.primary }]}>
          <Feather name="truck" size={16} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.fallbackText}>
          <Text style={[styles.fallbackLabel, { color: theme.colors.textMuted }]}>{t('orDriverLocation', 'Driver location')}</Text>
          <Text style={[styles.fallbackValue, { color: theme.colors.text }]}>
            {driver ? formatCoord(driver) : t('orWaitingForGps', 'Waiting for GPS…')}
          </Text>
        </View>
      </View>
      <View style={styles.fallbackRow}>
        <View style={[styles.pin, { backgroundColor: theme.colors.error }]}>
          <Feather name="home" size={16} color="#fff" />
        </View>
        <View style={styles.fallbackText}>
          <Text style={[styles.fallbackLabel, { color: theme.colors.textMuted }]}>{t('orDestination', 'Destination')}</Text>
          <Text style={[styles.fallbackValue, { color: theme.colors.text }]}>
            {destination ? formatCoord(destination) : t('orYourAddress', 'Your delivery address')}
          </Text>
        </View>
      </View>
      {etaMinutes != null ? (
        <View style={[styles.etaBadge, { backgroundColor: theme.colors.surface }]}>
          <Feather name="clock" size={14} color={theme.colors.primary} />
          <Text style={[styles.etaText, { color: theme.colors.text }]}>{t('orEtaMinutes', '{minutes} min', { minutes: etaMinutes })}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function OrderMap(props: Props) {
  const { driver, destination, height = 300 } = props;
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const focus = driver ?? destination;

  useEffect(() => {
    if (Platform.OS === 'web' || !mapRef.current) return;
    const points = [driver, destination].filter((point): point is LatLng => !!point);
    if (points.length === 2) {
      mapRef.current.fitToCoordinates(points, { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true });
    } else if (points.length === 1) {
      mapRef.current.animateToRegion({ ...points[0], latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
    }
  }, [driver, destination]);

  if (Platform.OS === 'web' || !focus) {
    return <WebFallback {...props} height={height} />;
  }

  return (
    <View style={[styles.mapWrap, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{ ...focus, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
      >
        {driver ? (
          <Marker coordinate={driver} title={t('orDriverLocation', 'Driver location')}>
            <View style={[styles.pin, { backgroundColor: theme.colors.primary }]}>
              <Feather name="truck" size={16} color={theme.colors.onPrimary} />
            </View>
          </Marker>
        ) : null}
        {destination ? (
          <Marker coordinate={destination} title={t('orDestination', 'Destination')} pinColor={theme.colors.error} />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { overflow: 'hidden' },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  fallback: { padding: 20, justifyContent: 'center', gap: 22, overflow: 'hidden' },
  fallbackRoute: { position: 'absolute', left: 36, top: '30%', bottom: '30%', borderLeftWidth: 2, borderStyle: 'dashed' },
  fallbackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fallbackText: { flex: 1 },
  fallbackLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  fallbackValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  etaBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  etaText: { fontSize: 13, fontWeight: '800' },
});
