import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useAppNavigation, useAppRoute } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";
import type { ApplicationRequirement, PropertyApplication } from "../services/propertyApplications";

type Draft = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  nationality: string;
  current_address: string;
  employment_status: string;
  occupation: string;
  move_in_date: string;
  rental_period_months: string;
  adults: string;
  children: string;
  has_pets: boolean;
  pet_details: string;
  additional_notes: string;
  preferred_lease_language: string;
};

type TextDraftKey = {
  [K in keyof Draft]: Draft[K] extends string ? K : never;
}[keyof Draft];

type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

const emptyDraft: Draft = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  nationality: "",
  current_address: "",
  employment_status: "",
  occupation: "",
  move_in_date: "",
  rental_period_months: "12",
  adults: "1",
  children: "0",
  has_pets: false,
  pet_details: "",
  additional_notes: "",
  preferred_lease_language: "en",
};

export default function PropertyApplicationWizardScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<"PropertyApplicationWizard">();
  const { t, languageCode } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, preferred_lease_language: languageCode });
  const [application, setApplication] = useState<PropertyApplication | null>(null);
  const [creating, setCreating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileByType, setFileByType] = useState<Record<string, PickedFile | null>>({});
  const [allowedLeaseMonths, setAllowedLeaseMonths] = useState<number[]>([6, 12]);
  const propertyId = route.params.propertyId;

  const requirements = useMemo(
    () => application?.requirements ?? [],
    [application],
  );

  useEffect(() => {
    let cancelled = false;
    const loadLeaseMonths = async () => {
      try {
        const res = await fetch(`${baseAPI}/properties/${propertyId}/`, {
          headers: { Accept: "application/json" },
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok || cancelled || !data || typeof data !== "object") return;
        const row = data as { allowed_lease_months?: unknown; purpose?: string };
        if (row.purpose && row.purpose !== "rent") {
          Alert.alert(t("error"), t("applicationsRentOnly", "Applications are only available for long-term rent listings."));
          navigation.goBack();
          return;
        }
        const months = Array.isArray(row.allowed_lease_months)
          ? row.allowed_lease_months
              .map((item) => Number(item))
              .filter((item) => Number.isFinite(item) && item > 0)
          : [];
        if (months.length > 0 && !cancelled) {
          setAllowedLeaseMonths(months);
          setDraft((current) => {
            const currentMonths = Number(current.rental_period_months);
            if (months.includes(currentMonths)) return current;
            return { ...current, rental_period_months: String(months[0]) };
          });
        }
      } catch {
        /* keep defaults */
      }
    };
    void loadLeaseMonths();
    return () => {
      cancelled = true;
    };
  }, [navigation, propertyId, t]);

  useEffect(() => {
    if (!token) {
      Alert.alert(t("loginRequired"), t("applicationLoginRequired"));
      navigation.replace("UserLogin");
      return;
    }
    const createDraft = async () => {
      try {
        const res = await fetch(`${baseAPI}/properties/applications/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            property_id: propertyId,
            preferred_lease_language: languageCode,
          }),
        });
        const created: unknown = await res.json().catch(() => null);
        if (!res.ok || !created || typeof created !== "object" || !("id" in created)) {
          throw new Error();
        }
        const detailRes = await fetch(
          `${baseAPI}/properties/applications/${Number((created as { id: number }).id)}/`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
        );
        const detail: unknown = await detailRes.json().catch(() => null);
        if (!detailRes.ok || !detail || typeof detail !== "object") throw new Error();
        const app = detail as PropertyApplication;
        setApplication(app);
        setDraft((current) => ({
          ...current,
          full_name: app.full_name || current.full_name,
          email: app.email || current.email,
          phone: app.phone || current.phone,
          preferred_lease_language: app.preferred_lease_language || languageCode,
        }));
      } catch {
        Alert.alert(t("error"), t("applicationSubmitFailed"));
        navigation.goBack();
      } finally {
        setCreating(false);
      }
    };
    void createDraft();
  }, [languageCode, navigation, propertyId, t, token]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const authHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  });

  const patchApplication = async (partial: Record<string, unknown>) => {
    if (!application) throw new Error("missing application");
    const res = await fetch(`${baseAPI}/properties/applications/${application.id}/`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok || !data || typeof data !== "object") throw new Error();
    setApplication(data as PropertyApplication);
  };

  const reqLabel = (req: ApplicationRequirement) => {
    const map: Record<string, string> = {
      en: req.label_en,
      pt: req.label_pt,
      fr: req.label_fr,
      es: req.label_es,
    };
    return map[languageCode] || req.label_en || req.document_type;
  };

  const requiredForStep = () => {
    if (step === 0) return Boolean(draft.full_name && draft.email && draft.phone && draft.current_address && draft.employment_status);
    if (step === 1) return Boolean(draft.move_in_date && draft.rental_period_months);
    if (step === 2) {
      const required = requirements.filter((item) => item.is_required);
      return required.every((item) => Boolean(fileByType[item.document_type]));
    }
    return true;
  };

  const pickDocument = async (documentType: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ["application/pdf", "image/*"],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setFileByType((current) => ({
      ...current,
      [documentType]: {
        uri: asset.uri,
        name: asset.name || `${documentType}.pdf`,
        mimeType: asset.mimeType,
      },
    }));
  };

  const next = async () => {
    if (!application || !requiredForStep()) {
      Alert.alert(t("error"), t("requiredApplicationFields"));
      return;
    }
    setSubmitting(true);
    try {
      if (step === 0) {
        await patchApplication({
          full_name: draft.full_name,
          email: draft.email,
          phone: draft.phone,
          date_of_birth: draft.date_of_birth || null,
          nationality: draft.nationality,
          current_address: draft.current_address,
          employment_status: draft.employment_status,
          occupation: draft.occupation,
        });
      } else if (step === 1) {
        await patchApplication({
          move_in_date: draft.move_in_date,
          rental_period_months: Number(draft.rental_period_months),
          adults: Number(draft.adults),
          children: Number(draft.children),
          has_pets: draft.has_pets,
          pet_details: draft.pet_details,
          additional_notes: draft.additional_notes,
          preferred_lease_language: draft.preferred_lease_language || languageCode,
        });
      } else if (step === 2) {
        for (const [documentType, file] of Object.entries(fileByType)) {
          if (!file) continue;
          const form = new FormData();
          form.append("document_type", documentType);
          form.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/pdf",
          } as unknown as Blob);
          const res = await fetch(`${baseAPI}/properties/applications/${application.id}/documents/`, {
            method: "POST",
            headers: authHeaders(),
            body: form,
          });
          if (!res.ok) throw new Error();
        }
        const detailRes = await fetch(`${baseAPI}/properties/applications/${application.id}/`, {
          headers: authHeaders(),
        });
        const detail: unknown = await detailRes.json().catch(() => null);
        if (!detailRes.ok || !detail || typeof detail !== "object") throw new Error();
        setApplication(detail as PropertyApplication);
      }
      setStep((current) => Math.min(current + 1, 3));
    } catch {
      Alert.alert(t("error"), t("applicationSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!application) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${baseAPI}/properties/applications/${application.id}/submit/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: "{}",
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") throw new Error();
      const submitted = data as PropertyApplication;
      Alert.alert(t("success"), t("applicationSubmitted"), [
        {
          text: t("close"),
          onPress: () =>
            navigation.replace("PropertyApplicationDetail", { applicationId: submitted.id }),
        },
      ]);
    } catch {
      Alert.alert(t("error"), t("applicationSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const input = (label: string, key: TextDraftKey, options?: { numeric?: boolean; multiline?: boolean }) => (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-semibold text-slate-700 mb-1`}>{label}</Text>
      <TextInput
        style={tw`bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-900 ${options?.multiline ? "min-h-24" : ""}`}
        value={String(draft[key])}
        onChangeText={(value) => update(key, value)}
        multiline={options?.multiline}
        keyboardType={options?.numeric ? "numeric" : "default"}
        textAlignVertical={options?.multiline ? "top" : "center"}
      />
    </View>
  );

  if (creating) {
    return (
      <View style={tw`flex-1 bg-slate-100 items-center justify-center`}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const titles = [
    t("applicationPersonalTitle"),
    t("applicationPreferencesTitle"),
    t("requiredDocuments"),
    t("applicationDetails"),
  ];

  return (
    <ScrollView style={tw`flex-1 bg-slate-100`} contentContainerStyle={tw`p-4 pb-10`}>
      <Text style={tw`text-xs font-bold uppercase tracking-widest text-amber-600`}>
        {t("propertyApplication")}
      </Text>
      <Text style={tw`text-2xl font-bold text-slate-900 mt-1`}>{titles[step]}</Text>
      <Text style={tw`text-slate-500 mt-1`}>
        {t("applicationStep", undefined, { current: step + 1, total: 4 })}
      </Text>
      <View style={tw`flex-row mt-4 mb-6 gap-2`}>
        {[0, 1, 2, 3].map((item) => (
          <View
            key={item}
            style={tw`h-1 flex-1 rounded-full ${item <= step ? "bg-amber-500" : "bg-slate-200"}`}
          />
        ))}
      </View>

      {step === 0 && (
        <View>
          {input(t("fullName"), "full_name")}
          {input(t("email"), "email")}
          {input(t("phone"), "phone")}
          {input(t("dateOfBirth"), "date_of_birth")}
          {input(t("nationality"), "nationality")}
          {input(t("currentAddress"), "current_address", { multiline: true })}
          {input(t("employmentStatus"), "employment_status")}
          {input(t("occupation"), "occupation")}
        </View>
      )}

      {step === 1 && (
        <View>
          {input(t("moveInDate"), "move_in_date")}
          <Text style={tw`text-sm font-semibold text-slate-700 mb-2`}>{t("rentalPeriod")}</Text>
          <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
            {allowedLeaseMonths.map((months) => {
              const active = Number(draft.rental_period_months) === months;
              return (
                <TouchableOpacity
                  key={months}
                  style={tw`rounded-xl px-4 py-2 border ${
                    active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                  }`}
                  onPress={() => update("rental_period_months", String(months))}
                >
                  <Text style={tw`font-semibold ${active ? "text-white" : "text-slate-700"}`}>
                    {t("monthsLabel", "{n} months").replace("{n}", String(months))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {input(t("adults"), "adults", { numeric: true })}
          {input(t("children"), "children", { numeric: true })}
          <View style={tw`flex-row justify-between items-center bg-white border border-slate-200 rounded-xl px-3 py-2 mb-4`}>
            <Text style={tw`text-sm font-semibold text-slate-700`}>{t("pets")}</Text>
            <Switch value={draft.has_pets} onValueChange={(value) => update("has_pets", value)} />
          </View>
          {draft.has_pets && input(t("petDetails"), "pet_details")}
          {input(t("leaseLanguage"), "preferred_lease_language")}
          {input(t("additionalNotes"), "additional_notes", { multiline: true })}
        </View>
      )}

      {step === 2 && (
        <View style={tw`gap-3`}>
          {requirements.length === 0 ? (
            <Text style={tw`text-slate-500`}>{t("noDocumentsRequired")}</Text>
          ) : (
            requirements.map((req) => {
              const picked = fileByType[req.document_type];
              return (
                <View key={req.id} style={tw`bg-white border border-slate-200 rounded-xl p-4`}>
                  <Text style={tw`font-semibold text-slate-900`}>
                    {reqLabel(req)}
                    {req.is_required ? " *" : ""}
                  </Text>
                  <Text style={tw`text-xs text-slate-500 mt-1`}>
                    {picked ? picked.name : t("uploadDocument")}
                  </Text>
                  <TouchableOpacity
                    style={tw`mt-3 self-start bg-slate-900 rounded-lg px-3 py-2`}
                    onPress={() => void pickDocument(req.document_type)}
                  >
                    <Text style={tw`text-white font-semibold text-sm`}>
                      {picked ? t("replaceDocument", "Replace") : t("uploadDocument")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {step === 3 && application && (
        <View style={tw`bg-white border border-slate-200 rounded-xl p-4 gap-2`}>
          <Text style={tw`font-semibold text-slate-900`}>{application.property_title}</Text>
          <Text style={tw`text-sm text-slate-600`}>{draft.full_name} · {draft.email}</Text>
          <Text style={tw`text-sm text-slate-600`}>{draft.phone}</Text>
          <Text style={tw`text-sm text-slate-600`}>{draft.current_address}</Text>
          <Text style={tw`text-sm text-slate-600`}>
            {t("moveInDate")}: {draft.move_in_date} · {t("rentalPeriod")}: {draft.rental_period_months}
          </Text>
          <Text style={tw`text-sm text-slate-600`}>
            {t("requiredDocuments")}: {Object.values(fileByType).filter(Boolean).length}
          </Text>
        </View>
      )}

      <View style={tw`flex-row gap-3 mt-4`}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep((current) => current - 1)}
            style={tw`flex-1 border border-slate-300 rounded-xl py-3 items-center`}
          >
            <Text style={tw`font-bold text-slate-700`}>{t("back")}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          disabled={submitting}
          onPress={() => void (step === 3 ? submit() : next())}
          style={tw`flex-1 bg-slate-900 rounded-xl py-3 items-center ${submitting ? "opacity-60" : ""}`}
        >
          <Text style={tw`font-bold text-white`}>
            {submitting ? "…" : step === 3 ? t("submitApplication") : t("continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
