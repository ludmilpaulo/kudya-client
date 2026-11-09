export type SupportedLanguage = "en" | "pt" | "fr" | "es";

export interface LanguagePreference {
  preferredLanguage: SupportedLanguage | null;
  systemLanguage: SupportedLanguage | null;
  activeLanguage: SupportedLanguage | null;
  preferenceSet: boolean;
}
