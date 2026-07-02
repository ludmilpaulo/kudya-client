import axios from 'axios';
import { baseAPI } from './types';
import type { User } from './adminTypes';

const api = axios.create({
  baseURL: baseAPI,
});

export interface WhyChooseUsRecord {
  id: number;
  title: string;
  content: string;
}

export interface TeamRecord {
  id: number;
  name: string;
  title: string;
  bio: string;
  image?: string | null;
}

export interface ContactRecord {
  id: number;
  subject: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

export interface AboutUsRecord {
  id: number;
  title: string;
  about: string;
}

type CmsWritePayload = Record<string, string | number | boolean | null | undefined>;

const INFO_PREFIX = '/info';

export const fetchAboutUs = async (): Promise<AboutUsRecord[]> => {
  const response = await api.get<AboutUsRecord[]>(`${baseAPI}${INFO_PREFIX}/aboutus/`);
  return response.data;
};

export const createAboutUs = async (data: CmsWritePayload): Promise<AboutUsRecord> => {
  const response = await api.post<AboutUsRecord>(`${baseAPI}${INFO_PREFIX}/aboutus/`, data);
  return response.data;
};

export const updateAboutUs = async (id: number, data: CmsWritePayload): Promise<AboutUsRecord> => {
  const response = await api.put<AboutUsRecord>(`${baseAPI}${INFO_PREFIX}/aboutus/${id}/`, data);
  return response.data;
};

export const deleteAboutUs = async (id: number): Promise<void> => {
  await api.delete(`${baseAPI}${INFO_PREFIX}/aboutus/${id}/`);
};

export const fetchWhyChooseUs = async (): Promise<WhyChooseUsRecord[]> => {
  const response = await api.get<WhyChooseUsRecord[]>(`${baseAPI}${INFO_PREFIX}/whychooseus/`);
  return response.data;
};

export const createWhyChooseUs = async (data: CmsWritePayload): Promise<WhyChooseUsRecord> => {
  const response = await api.post<WhyChooseUsRecord>(`${baseAPI}${INFO_PREFIX}/whychooseus/`, data);
  return response.data;
};

export const updateWhyChooseUs = async (
  id: number,
  data: CmsWritePayload,
): Promise<WhyChooseUsRecord> => {
  const response = await api.put<WhyChooseUsRecord>(
    `${baseAPI}${INFO_PREFIX}/whychooseus/${id}/`,
    data,
  );
  return response.data;
};

export const deleteWhyChooseUs = async (id: number): Promise<void> => {
  await api.delete(`${baseAPI}${INFO_PREFIX}/whychooseus/${id}/`);
};

export const fetchTeams = async (): Promise<TeamRecord[]> => {
  const response = await api.get<TeamRecord[]>(`${baseAPI}${INFO_PREFIX}/teams/`);
  return response.data;
};

export const createTeam = async (data: CmsWritePayload): Promise<TeamRecord> => {
  const response = await api.post<TeamRecord>(`${baseAPI}${INFO_PREFIX}/teams/`, data);
  return response.data;
};

export const updateTeam = async (id: number, data: CmsWritePayload): Promise<TeamRecord> => {
  const response = await api.put<TeamRecord>(`${baseAPI}${INFO_PREFIX}/teams/${id}/`, data);
  return response.data;
};

export const deleteTeam = async (id: number): Promise<void> => {
  await api.delete(`${baseAPI}${INFO_PREFIX}/teams/${id}/`);
};

export const fetchContacts = async (): Promise<ContactRecord[]> => {
  const response = await api.get<ContactRecord[]>(`${baseAPI}${INFO_PREFIX}/contacts/`);
  return response.data;
};

export const createContact = async (data: CmsWritePayload): Promise<ContactRecord> => {
  const response = await api.post<ContactRecord>(`${baseAPI}${INFO_PREFIX}/contacts/`, data);
  return response.data;
};

export const updateContact = async (id: number, data: CmsWritePayload): Promise<ContactRecord> => {
  const response = await api.put<ContactRecord>(`${baseAPI}${INFO_PREFIX}/contacts/${id}/`, data);
  return response.data;
};

export const deleteContact = async (id: number): Promise<void> => {
  await api.delete(`${baseAPI}${INFO_PREFIX}/contacts/${id}/`);
};

export const checkAdmin = async (_userId: string): Promise<boolean> => {
  const response = await api.get<{ is_platform_admin?: boolean; role?: string }>(
    `${baseAPI}/api/auth/me/`,
  );
  return Boolean(response.data.is_platform_admin) || response.data.role === 'super_admin';
};

interface MarketplaceCustomerRow {
  id: number;
  name: string;
  phone: string;
  address: string;
  total_orders: number;
}

function mapCustomerToUser(row: MarketplaceCustomerRow): User {
  const parts = row.name.trim().split(/\s+/);
  return {
    id: row.id,
    username: row.name,
    email: row.phone,
    first_name: parts[0] ?? row.name,
    last_name: parts.slice(1).join(' '),
    is_customer: true,
    is_driver: false,
  };
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<MarketplaceCustomerRow[]>(
    `${baseAPI}/api/v1/admin/marketplace/customers/`,
  );
  return response.data.map(mapCustomerToUser);
};

export const getUser = async (id: number): Promise<User> => {
  const users = await getUsers();
  const match = users.find((user) => user.id === id);
  if (!match) {
    throw new Error(`Customer ${id} not found`);
  }
  return match;
};

export const createUser = async (_user: User): Promise<User> => {
  throw new Error('User creation is not supported via this legacy admin screen.');
};

export const updateUser = async (_id: number, _user: User): Promise<User> => {
  throw new Error('User updates are not supported via this legacy admin screen.');
};

export const deleteUser = async (_id: number): Promise<void> => {
  throw new Error('User deletion is not supported via this legacy admin screen.');
};

export const fetchResources = async (resource: string): Promise<unknown> => {
  const response = await api.get(`/${resource}/`);
  return response.data;
};

export const createResource = async (
  resource: string,
  data: CmsWritePayload,
): Promise<unknown> => {
  const response = await api.post(`/${resource}/`, data);
  return response.data;
};

export const updateResource = async (
  resource: string,
  id: number,
  data: CmsWritePayload,
): Promise<unknown> => {
  const response = await api.put(`/${resource}/${id}/`, data);
  return response.data;
};

export const deleteResource = async (resource: string, id: number): Promise<void> => {
  await api.delete(`/${resource}/${id}/`);
};
