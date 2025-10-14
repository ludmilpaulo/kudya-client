import API from "./api";
import { baseAPI } from "./types";

export type ServiceCategory = {
  id: number;
  name: string;
  name_pt?: string;
  icon?: string;
};

export type ServiceListItem = {
  id: number;
  title: string;
  title_pt?: string;
  description?: string;
  price: number;
  currency: string;
  duration_minutes: number;
  delivery_type: string;
  image?: string | null;
  parceiro_name: string;
  category_name: string;
  average_rating: number;
  is_verified?: boolean;
};

export type ServiceDetail = ServiceListItem & {
  parceiro_phone?: string;
  parceiro_address?: string;
  tags?: string;
};

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await API.get(`${baseAPI}/services/categories/`);
  return data;
};

export const getServices = async (params?: {
  category?: number | string;
  q?: string;
}): Promise<ServiceListItem[]> => {
  const { data } = await API.get(`${baseAPI}/services/services/`, { params });
  return data;
};

export const getServiceById = async (id: number): Promise<ServiceDetail> => {
  const { data } = await API.get(`${baseAPI}/services/services/${id}/`);
  return data;
};

export const getServiceAvailability = async (
  id: number,
  start_date?: string,
  end_date?: string
) => {
  const { data } = await API.get(`${baseAPI}/services/services/${id}/availability`, {
    params: { start_date, end_date },
  });
  return data;
};

export const createBooking = async (payload: {
  service: number;
  customer: number;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  customer_notes?: string;
  payment_method?: string;
}) => {
  const { data } = await API.post(`${baseAPI}/services/bookings/`, payload);
  return data;
};

export const getMyBookings = async (): Promise<any[]> => {
  const { data } = await API.get(`${baseAPI}/services/bookings/`);
  return data;
};

