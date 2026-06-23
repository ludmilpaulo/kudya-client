import { baseAPI } from './types';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export type ClientPlatform = 'web' | 'mobile';

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
  sortOrder: number;
}

type RawPlatformModule = Partial<PlatformModule> & {
  title?: string;
  subtitle?: string;
  gradient_start?: string;
  gradient_end?: string;
  order?: number;
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

export const FALLBACK_HOME_MODULES: PlatformModule[] = [
  { id: 1, key: 'food', name: 'Food', slug: 'food', description: 'Restaurants & meals', icon: 'utensils', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], route: '/food', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 10 },
  { id: 2, key: 'groceries', name: 'Groceries', slug: 'groceries', description: 'Shops near you', icon: 'shopping-basket', color: '#10B981', gradient: ['#10B981', '#059669'], route: '/groceries', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 20 },
  { id: 3, key: 'property', name: 'Property', slug: 'property', description: 'Rent or buy', icon: 'home', color: '#8B5CF6', gradient: ['#8B5CF6', '#6D28D9'], route: '/property', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 30 },
  { id: 4, key: 'accommodation', name: 'Stay', slug: 'stay', description: 'Book accommodation', icon: 'bed', color: '#0EA5E9', gradient: ['#0EA5E9', '#0369A1'], route: '/stay', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 40 },
  { id: 5, key: 'services', name: 'Services', slug: 'services', description: 'Local professionals', icon: 'briefcase', color: '#2563EB', gradient: ['#2563EB', '#1D4ED8'], route: '/services', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 50 },
  { id: 6, key: 'doctors', name: 'Doctors', slug: 'doctors', description: 'Book consultations', icon: 'stethoscope', color: '#DC2626', gradient: ['#DC2626', '#B91C1C'], route: '/doctors', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 60 },
  { id: 7, key: 'car_rental', name: 'Car Rental', slug: 'car-rental', description: 'Rent a vehicle', icon: 'car-side', color: '#0F766E', gradient: ['#0F766E', '#115E59'], route: '/car-rental', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 70 },
  { id: 8, key: 'package', name: 'Send Package', slug: 'package', description: 'Courier delivery', icon: 'package', color: '#7C3AED', gradient: ['#7C3AED', '#6D28D9'], route: '/send-package', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 80 },
  { id: 9, key: 'wallet', name: 'Wallet', slug: 'wallet', description: 'Pay & manage money', icon: 'wallet', color: '#475569', gradient: ['#475569', '#334155'], route: '/wallet', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 90 },
  { id: 10, key: 'business', name: 'Business', slug: 'business', description: 'Corporate accounts', icon: 'building', color: '#1E293B', gradient: ['#1E293B', '#0F172A'], route: '/business', isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 100 },
];

function mapHomeModule(item: RawPlatformModule, index: number): PlatformModule {
  const gradientStart = item.gradient?.[0] || item.gradient_start || item.color || '#3B82F6';
  const gradientEnd = item.gradient?.[1] || item.gradient_end || item.color || '#1D4ED8';
  return {
    id: item.id ?? index,
    key: item.key || '',
    name: item.name || item.title || '',
    slug: item.slug || item.key || '',
    description: item.description || item.subtitle || '',
    icon: item.icon || 'grid',
    color: item.color || gradientStart,
    gradient: [gradientStart, gradientEnd] as [string, string],
    route: normalizeModuleRoute(item.route, item.key || item.slug),
    isActive: item.isActive ?? true,
    availableOnWeb: item.availableOnWeb ?? true,
    availableOnMobile: item.availableOnMobile ?? true,
    sortOrder: item.sortOrder ?? item.order ?? index,
  };
}

function filterHomeModules(modules: PlatformModule[], platform: ClientPlatform): PlatformModule[] {
  return modules
    .filter((item) => {
      if (platform === 'mobile' && item.availableOnMobile === false) return false;
      if (platform === 'web' && item.availableOnWeb === false) return false;
      return item.isActive;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
  const params = new URLSearchParams({ lang, platform });
  if (countryId) params.set('country', String(countryId));
  try {
    const response = await fetchWithTimeout(`${baseAPI}/api/platform/home-modules/?${params.toString()}`, {
      headers: withLanguageHeaders(lang),
    });
    if (!response.ok) {
      throw new Error('Failed to load home modules');
    }
    const data = (await response.json()) as RawPlatformModule[];
    const modules = filterHomeModules(data.map(mapHomeModule), platform);
    if (modules.length > 0) return modules;
  } catch {
    // fall through to defaults
  }
  return filterHomeModules(FALLBACK_HOME_MODULES, platform);
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
