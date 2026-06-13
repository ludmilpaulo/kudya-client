export type DoctorConsultationType = 'online' | 'physical';

export type DoctorDetailSection = 'overview' | 'location' | 'availability' | 'reviews';

export type Country = {
  id: number;
  name: string;
  code: string;
  currency: string;
  timezone?: string;
  flag_icon?: string;
  is_active?: boolean;
};

export type MedicalSpecialty = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  order?: number;
};

export type DoctorAvailability = {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
};

export type Doctor = {
  id: number;
  name: string;
  professional_title: string;
  specialty: number;
  specialty_name: string;
  specialty_slug?: string;
  years_experience: number;
  languages: string;
  country: number;
  country_name: string;
  country_code?: string;
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
  is_verified?: boolean;
  biography?: string;
  conditions_treated?: string;
  services_offered?: string;
  insurance_accepted?: string;
  availability?: DoctorAvailability[];
};

export type AppointmentSlot = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_blocked: boolean;
};

export type DoctorFilters = {
  search: string;
  countryCode?: string;
  countryId?: number;
  specialtySlug?: string;
  consultationType?: DoctorConsultationType;
};

export type PatientGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type PreferredLanguage = 'en' | 'pt' | 'fr' | 'es';

export type PatientDetailsPayload = {
  full_name: string;
  date_of_birth: string;
  age: number;
  phone_number: string;
  email: string;
  gender: PatientGender;
  preferred_language?: PreferredLanguage;
};

export type AppointmentPayload = {
  slot_id: number;
  appointment_type: DoctorConsultationType;
  reason: string;
  patient: PatientDetailsPayload;
  payment_method?: 'pay_now' | 'pay_at_clinic' | 'wallet' | 'mobile_money' | 'card';
};
