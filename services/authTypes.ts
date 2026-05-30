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
  message: string;
  user?: Record<string, unknown>;
};

export function normalizeAuthResponse(data: Record<string, unknown>): AuthSessionPayload {
  const access = String(data.access || data.token || '');
  const refresh = String(data.refresh || '');
  if (!access) {
    throw new Error(String(data.detail || data.message || 'Erro desconhecido.'));
  }
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
    message: String(data.message || 'Login com sucesso'),
    user: data.user as Record<string, unknown> | undefined,
  };
}

export type SocialAuthResult = AuthSessionPayload;
