import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';
import { getDeviceLanguage } from '../../services/api';
import { buildDoctorQuery } from '../../utils/doctorQuery';
import type { SupportedLocale } from '../../configs/translations';
import { toNumber } from '../../utils/formatNumber';
import type {
  AppointmentSlot,
  Country,
  Doctor,
  DoctorFilters,
  MedicalSpecialty,
} from '../../services/doctors/types';

type AuthRootState = {
  auth: {
    token: string | null;
  };
};

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

type LangQuery = SupportedLocale;

type DoctorFiltersWithLang = DoctorFilters & { lang: SupportedLocale };

function withLanguage(lang: SupportedLocale, url: string) {
  return {
    url,
    headers: { 'Accept-Language': lang || getDeviceLanguage() },
  };
}

export const doctorsApi = createApi({
  reducerPath: 'doctorsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseAPI,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as AuthRootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      if (!headers.has('Accept-Language')) {
        headers.set('Accept-Language', getDeviceLanguage());
      }
      return headers;
    },
  }),
  tagTypes: ['Doctors', 'Doctor', 'Specialties', 'Countries', 'Slots'],
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], LangQuery>({
      query: (lang) => withLanguage(lang, '/api/countries/'),
      transformResponse: (response: Country[] | { results: Country[] }) =>
        unwrapList(response).filter((c) => c.is_active !== false),
      providesTags: ['Countries'],
    }),
    getSpecialties: builder.query<MedicalSpecialty[], LangQuery>({
      query: (lang) => withLanguage(lang, '/api/doctors/specialties/'),
      transformResponse: (response: MedicalSpecialty[] | { results: MedicalSpecialty[] }) =>
        unwrapList(response),
      providesTags: ['Specialties'],
    }),
    getDoctors: builder.query<Doctor[], DoctorFiltersWithLang>({
      query: ({ lang, ...filters }) => {
        const qs = buildDoctorQuery(filters);
        const path = qs ? `/api/doctors/?${qs}` : '/api/doctors/';
        return withLanguage(lang, path);
      },
      transformResponse: (response: Doctor[] | { results: Doctor[] }) =>
        unwrapList(response).map(normalizeDoctor),
      providesTags: ['Doctors'],
    }),
    getDoctor: builder.query<Doctor, { id: number; lang: SupportedLocale }>({
      query: ({ id, lang }) => withLanguage(lang, `/api/doctors/${id}/`),
      transformResponse: (response: Doctor) => normalizeDoctor(response),
      providesTags: (_result, _error, arg) => [{ type: 'Doctor', id: arg.id }],
    }),
    getAvailableSlots: builder.query<
      AppointmentSlot[],
      { doctorId: number; date: string; lang: SupportedLocale }
    >({
      query: ({ doctorId, date, lang }) =>
        withLanguage(
          lang,
          `/api/doctors/${doctorId}/available-slots/?date=${encodeURIComponent(date)}`,
        ),
      providesTags: ['Slots'],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetSpecialtiesQuery,
  useGetDoctorsQuery,
  useGetDoctorQuery,
  useGetAvailableSlotsQuery,
} = doctorsApi;
