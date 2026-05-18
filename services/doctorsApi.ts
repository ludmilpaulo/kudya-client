import axios from 'axios';
import { baseAPI } from './types';

export interface MedicalSpecialty {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

export interface Doctor {
  id: number;
  name: string;
  professional_title: string;
  specialty: number;
  specialty_name: string;
  years_experience: number;
  languages: string;
  country: number;
  country_name: string;
  city: number | null;
  city_name: string | null;
  clinic_name: string;
  consultation_fee: number;
  currency: string;
  online_consultation_enabled: boolean;
  physical_consultation_enabled: boolean;
  rating: number;
  review_count: number;
  profile_photo: string | null;
  biography?: string;
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
}

export interface AppointmentPayload {
  doctor: number;
  appointment_type: 'physical' | 'online';
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function fetchSpecialties(): Promise<MedicalSpecialty[]> {
  const { data } = await axios.get(`${baseAPI}/api/doctors/specialties/`);
  return data.results ?? data;
}

export async function fetchDoctors(params?: Record<string, string | number>): Promise<Doctor[]> {
  const { data } = await axios.get(`${baseAPI}/api/doctors/`, { params });
  return data.results ?? data;
}

export async function fetchDoctor(id: number): Promise<Doctor> {
  const { data } = await axios.get(`${baseAPI}/api/doctors/${id}/`);
  return data;
}

export async function bookAppointment(token: string, payload: AppointmentPayload) {
  const { data } = await axios.post(
    `${baseAPI}/api/appointments/book/`,
    payload,
    { headers: authHeaders(token) },
  );
  return data;
}
