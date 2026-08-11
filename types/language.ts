export type SupportedLanguage = "en" | "pt" | "fr" | "es";

export interface LanguagePreference {
  preferredLanguage: SupportedLanguage;
  systemLanguage: SupportedLanguage | null;
  activeLanguage: SupportedLanguage;
}
