import { baseAPI } from './types';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export type ClientPlatform = 'web' | 'mobile' | 'parceiro' | 'customer';

export interface PlatformModule {
  id: number;
  key: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  route: string;
  isActive: boolean;
  availableOnWeb: boolean;
  availableOnMobile: boolean;
  availableOnParceiro?: boolean;
  sortOrder: number;
}

type RawPlatformModule = Partial<PlatformModule> & {
  title?: string;
  subtitle?: string;
  short_description?: string;
  gradient_start?: string;
  gradient_end?: string;
  order?: number;
  display_order?: number;
};

export interface BusinessCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  dashboard_route: string;
  feature_keys: string[];
  isActive: boolean;
  availableOnWeb: boolean;
  availableOnMobile: boolean;
  sortOrder: number;
}

export type MobileModuleScreen =
  | 'Categories'
  | 'Grocery'
  | 'Properties'
  | 'Accommodation'
  | 'MainTabs'
  | 'Services'
  | 'Doctors'
  | 'CarRental'
  | 'SendPackage'
  | 'Wallet'
  | 'BusinessDashboard'
  | 'Rides'
  | 'ComingSoon';

const MOBILE_MODULE_SCREEN_BY_KEY: Record<string, MobileModuleScreen> = {
  food: 'Categories',
  groceries: 'Grocery',
  property: 'Properties',
  accommodation: 'Accommodation',
  services: 'Services',
  doctors: 'Doctors',
  car_rental: 'CarRental',
  package: 'SendPackage',
  wallet: 'Wallet',
  business: 'BusinessDashboard',
  rides: 'Rides',
};

const MOBILE_MODULE_SCREEN_BY_PATH: Record<string, MobileModuleScreen> = {
  '/food': 'Categories',
  '/groceries': 'Grocery',
  '/property': 'Properties',
  '/stay': 'Accommodation',
  '/services': 'Services',
  '/doctors': 'Doctors',
  '/Doctors': 'Doctors',
  '/car-rental': 'CarRental',
  '/send-package': 'SendPackage',
  '/wallet': 'Wallet',
  '/business': 'BusinessDashboard',
  '/rides': 'Rides',
};

export function resolveMobileModuleScreen(route: string | undefined, key?: string): MobileModuleScreen {
  const moduleKey = (key || '').toLowerCase();
  if (moduleKey && MOBILE_MODULE_SCREEN_BY_KEY[moduleKey]) {
    return MOBILE_MODULE_SCREEN_BY_KEY[moduleKey];
  }

  if (!route) return 'ComingSoon';

  const normalized = route.startsWith('/') ? route : `/${route}`;
  if (MOBILE_MODULE_SCREEN_BY_PATH[normalized]) {
    return MOBILE_MODULE_SCREEN_BY_PATH[normalized];
  }

  const lower = normalized.toLowerCase();
  return MOBILE_MODULE_SCREEN_BY_PATH[lower] ?? 'ComingSoon';
}

const LEGACY_MODULE_ROUTES: Record<string, string> = {
  Food: '/food',
  Grocery: '/groceries',
  Groceries: '/groceries',
  Rides: '/rides',
  SendPackage: '/send-package',
  CarRental: '/car-rental',
  Doctors: '/doctors',
  Services: '/services',
  Accommodation: '/stay',
  Stay: '/stay',
  Properties: '/property',
  Property: '/property',
  Wallet: '/wallet',
  ComingSoon: '/business',
  Business: '/business',
};

function normalizeModuleRoute(route: string | undefined, key?: string): string {
  if (!route) return '/';
  if (route.startsWith('/')) return route;
  if (LEGACY_MODULE_ROUTES[route]) return LEGACY_MODULE_ROUTES[route];

  const slug = (key || route).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return `/${slug}`;
}

function mapHomeModule(item: RawPlatformModule, index: number): PlatformModule {
  const gradientStart = item.gradient?.[0] || item.gradient_start || item.color || '#3B82F6';
  const gradientEnd = item.gradient?.[1] || item.gradient_end || item.color || '#1D4ED8';
  return {
    id: item.id ?? index,
    key: item.key || '',
    name: item.name || item.title || '',
    slug: item.slug || item.key || '',
    description: item.description || item.subtitle || item.short_description || '',
    icon: item.icon || 'grid',
    color: item.color || gradientStart,
    gradient: [gradientStart, gradientEnd] as [string, string],
    route: normalizeModuleRoute(item.route, item.key || item.slug),
    isActive: item.isActive ?? true,
    availableOnWeb: item.availableOnWeb ?? true,
    availableOnMobile: item.availableOnMobile ?? true,
    availableOnParceiro: item.availableOnParceiro ?? true,
    sortOrder: item.sortOrder ?? item.display_order ?? item.order ?? index,
  };
}

function normalizePlatformParam(platform: ClientPlatform): string {
  if (platform === 'customer') return 'mobile';
  return platform;
}

function withLanguageHeaders(lang: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Accept-Language': lang,
  };
}

export async function fetchHomeModules(
  lang = 'en',
  platform: ClientPlatform = 'mobile',
  countryId?: number,
): Promise<PlatformModule[]> {
  const params = new URLSearchParams({ lang, platform: normalizePlatformParam(platform) });
  if (countryId) params.set('country', String(countryId));
  const endpoints = [
    `${baseAPI}/api/platform/services/?${params.toString()}`,
    `${baseAPI}/api/platform/home-modules/?${params.toString()}`,
  ];
  for (const url of endpoints) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: withLanguageHeaders(lang),
      });
      if (!response.ok) continue;
      const body = (await response.json()) as RawPlatformModule[] | { results?: RawPlatformModule[] };
      const rows = Array.isArray(body) ? body : body.results || [];
      return rows.map(mapHomeModule).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      // try next
    }
  }
  return [];
}

export async function fetchPlatformService(
  slug: string,
  lang = 'en',
  platform: ClientPlatform = 'mobile',
): Promise<PlatformModule | null> {
  const params = new URLSearchParams({ lang, platform: normalizePlatformParam(platform) });
  const response = await fetchWithTimeout(
    `${baseAPI}/api/platform/services/${encodeURIComponent(slug)}/?${params.toString()}`,
    { headers: withLanguageHeaders(lang) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to load platform service');
  return mapHomeModule((await response.json()) as RawPlatformModule, 0);
}

export async function fetchBusinessCategories(
  lang = 'en',
  platform: ClientPlatform = 'mobile',
): Promise<BusinessCategory[]> {
  const params = new URLSearchParams({ platform });
  const response = await fetchWithTimeout(`${baseAPI}/api/platform/business-categories/?${params.toString()}`, {
    headers: withLanguageHeaders(lang),
  });
  if (!response.ok) {
    throw new Error('Failed to load business categories');
  }
  return response.json() as Promise<BusinessCategory[]>;
}

export async function fetchApiTranslations(lang: string, module?: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({ lang });
  if (module) params.set('module', module);
  const response = await fetchWithTimeout(`${baseAPI}/api/translations/?${params.toString()}`, {
    headers: withLanguageHeaders(lang),
  });
  if (!response.ok) {
    throw new Error('Failed to load translations');
  }
  return response.json() as Promise<Record<string, string>>;
}
