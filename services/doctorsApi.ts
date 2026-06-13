import axios from 'axios';
import { baseAPI } from './types';
import type {
  AppointmentPayload,
  Doctor,
  MedicalSpecialty,
  AppointmentSlot,
  Country,
  DoctorFilters,
} from './doctors/types';
import { buildDoctorQuery } from '../utils/doctorQuery';
import { toNumber } from '../utils/formatNumber';

export type {
  AppointmentPayload,
  AppointmentSlot,
  Country,
  Doctor,
  DoctorConsultationType,
  DoctorDetailSection,
  DoctorFilters,
  MedicalSpecialty,
  PatientDetailsPayload,
  PatientGender,
} from './doctors/types';

function normalizeDoctor(raw: Doctor): Doctor {
  return {
    ...raw,
    rating: toNumber(raw.rating),
    review_count: toNumber(raw.review_count),
    consultation_fee: toNumber(raw.consultation_fee),
    years_experience: toNumber(raw.years_experience),
  };
}

function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function fetchCountries(): Promise<Country[]> {
  const { data } = await axios.get<Country[] | { results: Country[] }>(`${baseAPI}/api/countries/`);
  return unwrapList(data).filter((c) => c.is_active !== false);
}

export async function fetchSpecialties(): Promise<MedicalSpecialty[]> {
  const { data } = await axios.get<MedicalSpecialty[] | { results: MedicalSpecialty[] }>(
    `${baseAPI}/api/doctors/specialties/`,
  );
  return unwrapList(data);
}

export async function fetchDoctors(filters: DoctorFilters = { search: '' }): Promise<Doctor[]> {
  const qs = buildDoctorQuery(filters);
  const { data } = await axios.get<Doctor[] | { results: Doctor[] }>(
    qs ? `${baseAPI}/api/doctors/?${qs}` : `${baseAPI}/api/doctors/`,
  );
  return unwrapList(data).map(normalizeDoctor);
}

export async function fetchDoctor(id: number): Promise<Doctor> {
  const { data } = await axios.get<Doctor>(`${baseAPI}/api/doctors/${id}/`);
  return normalizeDoctor(data);
}

export async function fetchAvailableSlots(doctorId: number, date: string): Promise<AppointmentSlot[]> {
  const { data } = await axios.get<AppointmentSlot[]>(
    `${baseAPI}/api/doctors/${doctorId}/available-slots/`,
    { params: { date } },
  );
  return data;
}

export async function bookAppointment(payload: AppointmentPayload, token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const { data } = await axios.post(
    `${baseAPI}/api/doctor-appointments/book/`,
    {
      slot_id: payload.slot_id,
      appointment_type: payload.appointment_type,
      consultation_type: payload.appointment_type === 'physical' ? 'in_person' : 'online',
      reason: payload.reason,
      notes: payload.reason,
      patient: payload.patient,
      payment_method: payload.payment_method ?? 'pay_at_clinic',
    },
    { headers },
  );
  return data;
}
