export type BusinessProfile = {
  id: number;
  businessName: string;
  category:
    | 'restaurant'
    | 'grocery'
    | 'property'
    | 'stay'
    | 'doctor'
    | 'service_provider'
    | 'car_rental'
    | 'courier'
    | 'business';
  dashboardRoute: string;
  isApproved: boolean;
  isActive: boolean;
};

export type AuthSessionPayload = {
  access: string;
  refresh: string;
  token: string;
  api_token?: string;
  auth_scheme: 'Bearer';
  user_id: number;
  username: string;
  is_customer: boolean;
  is_driver: boolean;
  preferred_language?: string;
  message: string;
  user?: Record<string, unknown>;
  business_profile?: BusinessProfile;
};

export function normalizeAuthResponse(data: Record<string, unknown>): AuthSessionPayload {
  const access = String(data.access || data.token || '');
  const refresh = String(data.refresh || '');
  if (!access) {
    throw new Error(String(data.detail || data.message || 'Erro desconhecido.'));
  }
  const businessProfileRaw = data.business_profile as
    | {
        id?: unknown;
        businessName?: unknown;
        category?: unknown;
        dashboardRoute?: unknown;
        isApproved?: unknown;
        isActive?: unknown;
      }
    | undefined;

  const userRaw = data.user as { preferred_language?: string } | undefined;

  return {
    access,
    refresh,
    token: access,
    api_token: data.api_token ? String(data.api_token) : undefined,
    auth_scheme: 'Bearer',
    user_id: Number(data.user_id),
    username: String(data.username || ''),
    is_customer: Boolean(data.is_customer),
    is_driver: Boolean(data.is_driver),
    preferred_language: userRaw?.preferred_language,
    message: String(data.message || 'Login com sucesso'),
    user: data.user as Record<string, unknown> | undefined,
    business_profile: businessProfileRaw
      ? {
          id: Number(businessProfileRaw.id),
          businessName: String(businessProfileRaw.businessName || ''),
          category: String(businessProfileRaw.category || 'business') as BusinessProfile['category'],
          dashboardRoute: String(businessProfileRaw.dashboardRoute || ''),
          isApproved: Boolean(businessProfileRaw.isApproved),
          isActive: Boolean(businessProfileRaw.isActive),
        }
      : undefined,
  };
}

export type SocialAuthResult = AuthSessionPayload;
