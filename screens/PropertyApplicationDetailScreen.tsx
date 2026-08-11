import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { useAppNavigation, useAppRoute } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";
import type { ApplicationTimelineStep, Lease, PropertyApplication } from "../services/propertyApplications";
import { openPropertyDirections, toMapCoords, type MapCoords } from "../utils/propertyDirections";

function detailMessage(data: unknown): string {
  return data && typeof data === "object" && "detail" in data ? String((data as { detail: unknown }).detail) : "";
}

export default function PropertyApplicationDetailScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<"PropertyApplicationDetail">();
  const { t, languageCode } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [application, setApplication] = useState<PropertyApplication | null>(null);
  const [timeline, setTimeline] = useState<ApplicationTimelineStep[]>([]);
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureName, setSignatureName] = useState("");
  const [signing, setSigning] = useState(false);
  const [directionsCoords, setDirectionsCoords] = useState<MapCoords | null>(null);
  const applicationId = route.params.applicationId;

  const loadPropertyDirections = useCallback(async (propertyId: number, authToken: string) => {
    try {
      const res = await fetch(`${baseAPI}/api/properties/${propertyId}/`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
      });
      if (!res.ok) {
        setDirectionsCoords(null);
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      if (!data || typeof data !== "object") {
        setDirectionsCoords(null);
        return;
      }
      const row = data as {
        can_get_directions?: boolean;
        latitude?: number | null;
        longitude?: number | null;
        location?: { latitude?: number | null; longitude?: number | null };
      };
      if (!row.can_get_directions) {
        setDirectionsCoords(null);
        return;
      }
      setDirectionsCoords(
        toMapCoords(row.location?.latitude, row.location?.longitude) ||
          toMapCoords(row.latitude, row.longitude),
      );
    } catch {
      setDirectionsCoords(null);
    }
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      const [applicationRes, timelineRes, leaseRes] = await Promise.all([
        fetch(`${baseAPI}/properties/applications/${applicationId}/`, { headers }),
        fetch(`${baseAPI}/properties/applications/${applicationId}/timeline/`, { headers }),
        fetch(`${baseAPI}/properties/applications/${applicationId}/lease/`, { headers }),
      ]);
      const applicationData: unknown = await applicationRes.json().catch(() => null);
      const timelineData: unknown = await timelineRes.json().catch(() => null);
      const leaseData: unknown = await leaseRes.json().catch(() => null);
      const next =
        applicationRes.ok && applicationData && typeof applicationData === "object"
          ? (applicationData as PropertyApplication)
          : null;
      setApplication(next);
      setTimeline(timelineData && typeof timelineData === "object" && "timeline" in timelineData && Array.isArray((timelineData as { timeline: unknown }).timeline)
        ? (timelineData as { timeline: ApplicationTimelineStep[] }).timeline : []);
      setLease(leaseRes.ok && leaseData && typeof leaseData === "object" ? leaseData as Lease : null);
      const hasConfirmedViewing = (next?.viewings || []).some(
        (v) => v.status === "confirmed" || v.status === "completed",
      );
      if (next && hasConfirmedViewing) {
        await loadPropertyDirections(next.property_listing, token);
      } else {
        setDirectionsCoords(null);
      }
    } finally {
      setLoading(false);
    }
  }, [applicationId, token, loadPropertyDirections]);

  useEffect(() => { void load(); }, [load]);

  const signLease = async () => {
    if (!lease || !signatureName.trim() || !token) return;
    setSigning(true);
    try {
      const res = await fetch(`${baseAPI}/properties/leases/${lease.id}/sign/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ signature_name: signatureName.trim(), language: languageCode }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) throw new Error(detailMessage(data));
      setLease(data as Lease);
      Alert.alert(t("success"), t("leaseSigned"));
    } catch (error) {
      Alert.alert(t("error"), error instanceof Error && error.message ? error.message : t("leaseSignFailed"));
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <View style={tw`flex-1 bg-slate-100 items-center justify-center`}><ActivityIndicator size="large" color="#f59e0b" /></View>;
  if (!application) return <View style={tw`flex-1 bg-slate-100 items-center justify-center px-8`}><Text style={tw`text-slate-600 text-center`}>{t("propertyNotFound")}</Text></View>;

  const requirementLabel = (requirement: PropertyApplication["requirements"][number]) =>
    languageCode === "pt" ? requirement.label_pt : languageCode === "fr" ? requirement.label_fr : languageCode === "es" ? requirement.label_es : requirement.label_en;
  const statusLabel = (status: string) => status === "verified" ? t("documentVerified") : status === "rejected" ? t("documentRejected") : t("documentPending");
  const tenantSigned = Boolean(lease?.signatures.some((signature) => signature.role === "tenant" && signature.is_signed));

  return (
    <ScrollView style={tw`flex-1 bg-slate-100`} contentContainerStyle={tw`p-4 pb-10`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`flex-row items-center self-start mb-4`}><MaterialIcons name="arrow-back" size={22} color="#475569" /><Text style={tw`text-slate-600 ml-1`}>{t("back")}</Text></TouchableOpacity>
      <View style={tw`bg-slate-900 rounded-2xl p-5`}><Text style={tw`text-xs text-amber-400 font-bold uppercase`}>{t("applicationStatus")}</Text><Text style={tw`text-white text-2xl font-bold mt-1`}>{application.property_title}</Text><Text style={tw`text-slate-300 mt-2 capitalize`}>{application.status.replace(/_/g, " ")}</Text></View>
      <Text style={tw`text-lg font-bold text-slate-900 mt-6 mb-3`}>{t("applicationTimeline")}</Text>
      <View style={tw`bg-white rounded-2xl border border-slate-200 p-4`}>
        {timeline.map((item) => <View key={item.key} style={tw`flex-row mb-4`}><MaterialIcons name={item.state === "done" ? "check-circle" : item.state === "current" ? "radio-button-checked" : "radio-button-unchecked"} size={20} color={item.state === "done" ? "#16a34a" : item.state === "current" ? "#f59e0b" : "#94a3b8"} /><View style={tw`ml-3 flex-1`}><Text style={tw`text-slate-800 font-semibold`}>{item.label}</Text>{item.note ? <Text style={tw`text-slate-500 text-sm mt-0.5`}>{item.note}</Text> : null}</View></View>)}
      </View>
      <Text style={tw`text-lg font-bold text-slate-900 mt-6 mb-3`}>{t("documents")}</Text>
      <View style={tw`bg-white rounded-2xl border border-slate-200 p-4`}>
        {application.requirements.length === 0 ? <Text style={tw`text-slate-500`}>{t("noDocumentsRequired")}</Text> : application.requirements.map((item) => <Text key={item.id} style={tw`text-slate-700 mb-2`}>• {requirementLabel(item)}{item.is_required ? " *" : ""}</Text>)}
        {application.documents.length > 0 && <><Text style={tw`font-bold text-slate-800 mt-3 mb-2`}>{t("uploadedDocuments")}</Text>{application.documents.map((document) => <View key={document.id} style={tw`flex-row justify-between mb-2`}><Text style={tw`text-slate-600 flex-1`} numberOfLines={1}>{document.original_filename}</Text><Text style={tw`text-xs font-bold text-slate-500`}>{statusLabel(document.status)}</Text></View>)}</>}
      </View>
      {(application.viewings || []).length > 0 ? (
        <>
          <Text style={tw`text-lg font-bold text-slate-900 mt-6 mb-3`}>
            {t("viewing_required", "Property viewing")}
          </Text>
          {(application.viewings || []).map((viewing) => (
            <View key={viewing.id} style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}>
              <Text style={tw`text-slate-800 font-semibold`}>
                {new Date(viewing.scheduled_at).toLocaleString()}
              </Text>
              {viewing.location ? (
                <Text style={tw`text-slate-500 text-sm mt-1`}>{viewing.location}</Text>
              ) : null}
              <Text style={tw`text-xs uppercase text-slate-400 mt-1`}>{viewing.status}</Text>
              {(viewing.status === "confirmed" || viewing.status === "completed") &&
              directionsCoords ? (
                <TouchableOpacity
                  onPress={() => void openPropertyDirections(directionsCoords)}
                  style={tw`mt-3 bg-slate-900 rounded-xl py-3 flex-row items-center justify-center`}
                >
                  <MaterialIcons name="directions" size={18} color="#fff" />
                  <Text style={tw`text-white font-bold ml-2`}>
                    {t("getDirections", "Get Directions")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </>
      ) : null}
      <Text style={tw`text-lg font-bold text-slate-900 mt-6 mb-3`}>{t("lease")}</Text>
      <View style={tw`bg-white rounded-2xl border border-slate-200 p-4`}>
        {!lease ? <Text style={tw`text-slate-500`}>{t("noLeaseAvailable")}</Text> : <><Text style={tw`text-slate-700 font-semibold`}>{lease.start_date} — {lease.end_date}</Text><Text style={tw`text-slate-600 mt-2`}>{lease.rendered_body}</Text>{!tenantSigned && <><TextInput value={signatureName} onChangeText={setSignatureName} placeholder={t("signatureName")} style={tw`border border-slate-200 rounded-xl px-3 py-3 mt-4 text-slate-900`} /><TouchableOpacity disabled={signing || !signatureName.trim()} onPress={() => void signLease()} style={tw`bg-slate-900 rounded-xl py-3 items-center mt-3 ${signing || !signatureName.trim() ? "opacity-60" : ""}`}><Text style={tw`text-white font-bold`}>{signing ? "…" : t("signLease")}</Text></TouchableOpacity></>}</>}
      </View>
    </ScrollView>
  );
}
