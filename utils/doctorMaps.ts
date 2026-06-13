import { Linking, Platform } from 'react-native';
import type { Doctor } from '../services/doctors/types';

export function formatDoctorAddress(doctor: Pick<Doctor, 'clinic_name' | 'city_name' | 'country_name'>): string {
  return [doctor.clinic_name, doctor.city_name, doctor.country_name].filter(Boolean).join(', ');
}

export function formatDoctorLocationLine(doctor: Pick<Doctor, 'city_name' | 'country_name' | 'years_experience'>): string {
  const location = [doctor.city_name, doctor.country_name].filter(Boolean).join(', ');
  const exp = `${doctor.years_experience}y exp`;
  return location ? `${location} · ${exp}` : exp;
}

export async function openDoctorInMaps(doctor: Pick<Doctor, 'clinic_name' | 'city_name' | 'country_name'>): Promise<void> {
  const address = encodeURIComponent(formatDoctorAddress(doctor));
  const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
  await Linking.openURL(url);
}

export async function openDirections(doctor: Pick<Doctor, 'clinic_name' | 'city_name' | 'country_name'>): Promise<void> {
  const destination = encodeURIComponent(formatDoctorAddress(doctor));
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  await Linking.openURL(url);
}
