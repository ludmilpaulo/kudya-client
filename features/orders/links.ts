import { Linking } from 'react-native';
import { toast } from '../../utils/notify';

export async function openExternal(url: string, failureTitle: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    toast('error', failureTitle);
  }
}

export function callPhone(phone: string | null | undefined, failureTitle: string): void {
  if (!phone) return;
  void openExternal(`tel:${phone.replace(/[^\d+]/g, '')}`, failureTitle);
}
