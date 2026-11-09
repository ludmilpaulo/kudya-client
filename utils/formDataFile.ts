import { Platform } from 'react-native';

/** React Native FormData file payload (uri/name/type). */
export type RNFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

/** Native RN FormData accepts { uri, name, type }; the browser needs a real Blob/File. */
export async function appendFormDataFile(
  formData: FormData,
  field: string,
  file: RNFormDataFile,
): Promise<void> {
  if (!file?.uri) return;
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const type = file.type || blob.type || 'application/octet-stream';
    formData.append(field, new File([blob], file.name || 'upload', { type }));
    return;
  }
  formData.append(field, file as unknown as Blob);
}

export function mimeTypeForName(name: string | null | undefined, fallback = 'image/jpeg'): string {
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return fallback;
}
