import API from '../../services/api';
import { API_V1_PREFIX } from './endpoints';

export const v1Client = {
  get: <T = unknown>(path: string, config?: Parameters<typeof API.get>[1]) =>
    API.get<T>(`${API_V1_PREFIX}${path}`, config),
  post: <T = unknown>(path: string, data?: unknown, config?: Parameters<typeof API.post>[2]) =>
    API.post<T>(`${API_V1_PREFIX}${path}`, data, config),
  patch: <T = unknown>(path: string, data?: unknown, config?: Parameters<typeof API.patch>[2]) =>
    API.patch<T>(`${API_V1_PREFIX}${path}`, data, config),
};

export default v1Client;
