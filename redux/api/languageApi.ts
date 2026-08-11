import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "../../services/types";
import { getDeviceLanguage } from "../../services/api";
import type { LanguagePreference, SupportedLanguage } from "../../types/language";

type RawRecord = Record<string, unknown>;

type RootStateWithAuth = {
  auth: { token: string | null };
};

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  return {
    preferredLanguage: String(raw.preferredLanguage ?? raw.preferred_language ?? "en") as SupportedLanguage,
    systemLanguage: raw.systemLanguage
      ? (String(raw.systemLanguage) as SupportedLanguage)
      : raw.system_language
        ? (String(raw.system_language) as SupportedLanguage)
        : null,
    activeLanguage: String(raw.activeLanguage ?? raw.active_language ?? "en") as SupportedLanguage,
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
      { preferredLanguage: SupportedLanguage; systemLanguage?: SupportedLanguage | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          preferredLanguage: body.preferredLanguage,
          systemLanguage: body.systemLanguage,
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
