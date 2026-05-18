import axios from 'axios';
import { baseAPI } from './types';

export interface PlatformModule {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  gradient_start: string;
  gradient_end: string;
  order: number;
  requires_auth: boolean;
}

export async function fetchHomeModules(lang = 'en', countryId?: number): Promise<PlatformModule[]> {
  const params: Record<string, string | number> = { lang };
  if (countryId) params.country = countryId;
  const { data } = await axios.get<PlatformModule[]>(`${baseAPI}/api/platform/home-modules/`, { params });
  return data;
}

export async function fetchApiTranslations(lang: string, module?: string): Promise<Record<string, string>> {
  const params: Record<string, string> = { lang };
  if (module) params.module = module;
  const { data } = await axios.get<Record<string, string>>(`${baseAPI}/api/translations/`, { params });
  return data;
}
