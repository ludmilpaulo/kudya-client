import type { SupportedLocale } from '../configs/translations';

const SPECIALTY_LABELS: Record<string, Record<SupportedLocale, string>> = {
  general: {
    en: 'General Practitioner',
    pt: 'Clínico Geral',
    fr: 'Médecin généraliste',
    es: 'Médico general',
  },
  dentist: {
    en: 'Dentist',
    pt: 'Dentista',
    fr: 'Dentiste',
    es: 'Dentista',
  },
  dermatologist: {
    en: 'Dermatologist',
    pt: 'Dermatologista',
    fr: 'Dermatologue',
    es: 'Dermatólogo',
  },
  gynecologist: {
    en: 'Gynecologist',
    pt: 'Ginecologista',
    fr: 'Gynécologue',
    es: 'Ginecólogo',
  },
  pediatrician: {
    en: 'Pediatrician',
    pt: 'Pediatra',
    fr: 'Pédiatre',
    es: 'Pediatra',
  },
  psychologist: {
    en: 'Psychologist',
    pt: 'Psicólogo',
    fr: 'Psychologue',
    es: 'Psicólogo',
  },
  physiotherapist: {
    en: 'Physiotherapist',
    pt: 'Fisioterapeuta',
    fr: 'Kinésithérapeute',
    es: 'Fisioterapeuta',
  },
  cardiologist: {
    en: 'Cardiologist',
    pt: 'Cardiologista',
    fr: 'Cardiologue',
    es: 'Cardiólogo',
  },
  orthopedic: {
    en: 'Orthopedic Doctor',
    pt: 'Ortopedista',
    fr: 'Médecin orthopédiste',
    es: 'Traumatólogo',
  },
  optometrist: {
    en: 'Eye Doctor / Optometrist',
    pt: 'Oftalmologista / Optometrista',
    fr: 'Ophtalmologue / Optométriste',
    es: 'Oftalmólogo / Optometrista',
  },
  ent: {
    en: 'ENT Specialist',
    pt: 'Otorrinolaringologista',
    fr: 'ORL',
    es: 'Otorrinolaringólogo',
  },
  nutritionist: {
    en: 'Nutritionist',
    pt: 'Nutricionista',
    fr: 'Nutritionniste',
    es: 'Nutricionista',
  },
  mental_health: {
    en: 'Mental Health Professional',
    pt: 'Profissional de saúde mental',
    fr: 'Professionnel de santé mentale',
    es: 'Profesional de salud mental',
  },
  other: {
    en: 'Other Specialist',
    pt: 'Outra especialidade',
    fr: 'Autre spécialiste',
    es: 'Otra especialidad',
  },
};

export function translateSpecialtyName(
  slug: string | undefined,
  fallbackName: string,
  locale: SupportedLocale,
): string {
  if (!slug) return fallbackName;
  const labels = SPECIALTY_LABELS[slug];
  if (!labels) return fallbackName;
  return labels[locale] ?? labels.en ?? fallbackName;
}
