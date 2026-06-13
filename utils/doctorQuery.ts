import type { DoctorFilters } from '../services/doctors/types';

export function buildDoctorQuery(filters: DoctorFilters): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.append('search', filters.search.trim());
  }

  if (filters.countryCode) {
    params.append('country', filters.countryCode);
  } else if (filters.countryId) {
    params.append('country', String(filters.countryId));
  }

  if (filters.specialtySlug) {
    params.append('specialty_slug', filters.specialtySlug);
  }

  if (filters.consultationType) {
    params.append('consultation_type', filters.consultationType);
  }

  return params.toString();
}
