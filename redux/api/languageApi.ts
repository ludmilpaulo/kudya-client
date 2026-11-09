import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "../../services/types";
import { getDeviceLanguage } from "../../services/api";
import type { LanguagePreference, SupportedLanguage } from "../../types/language";

type RawRecord = Record<string, unknown>;

type RootStateWithAuth = {
  auth: { token: string | null };
};

function asLanguage(value: unknown): SupportedLanguage | null {
  if (typeof value !== "string" || !value) return null;
  const code = value.slice(0, 2).toLowerCase();
  if (code === "en" || code === "pt" || code === "fr" || code === "es") return code;
  return null;
}

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  const hasFlag = "preferenceSet" in raw || "preference_set" in raw;
  const preferenceSet = raw.preferenceSet === true || raw.preference_set === true;
  const preferred =
    hasFlag && !preferenceSet ? null : asLanguage(raw.preferredLanguage ?? raw.preferred_language);
  const system = asLanguage(raw.systemLanguage ?? raw.system_language);
  return {
    preferredLanguage: preferred,
    systemLanguage: system,
    activeLanguage: asLanguage(raw.activeLanguage ?? raw.active_language) ?? preferred ?? system,
    preferenceSet: hasFlag ? preferenceSet : preferred != null,
  };
}

const languageBaseQuery = fetchBaseQuery({
  baseUrl: `${baseAPI}/api/me`,
  prepareHeaders: (headers, { getState }) => {
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    headers.set("Accept-Language", getDeviceLanguage());
    const token = (getState() as RootStateWithAuth).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const languageApi = createApi({
  reducerPath: "languageApi",
  baseQuery: languageBaseQuery,
  endpoints: (builder) => ({
    getLanguagePreference: builder.query<LanguagePreference, void>({
      query: () => "/language/",
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
    updateLanguagePreference: builder.mutation<
      LanguagePreference,
      { preferredLanguage?: SupportedLanguage; systemLanguage?: SupportedLanguage | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          ...(body.preferredLanguage ? { preferredLanguage: body.preferredLanguage } : {}),
          ...(body.systemLanguage ? { systemLanguage: body.systemLanguage } : {}),
        },
      }),
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
  }),
});

export const {
  useGetLanguagePreferenceQuery,
  useUpdateLanguagePreferenceMutation,
} = languageApi;
