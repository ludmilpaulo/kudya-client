import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'kudya_doctor_favorites';

export async function getFavoriteDoctorIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function isDoctorFavorite(doctorId: number): Promise<boolean> {
  const ids = await getFavoriteDoctorIds();
  return ids.includes(doctorId);
}

export async function toggleDoctorFavorite(doctorId: number): Promise<boolean> {
  const ids = await getFavoriteDoctorIds();
  const exists = ids.includes(doctorId);
  const next = exists ? ids.filter((id) => id !== doctorId) : [...ids, doctorId];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return !exists;
}
