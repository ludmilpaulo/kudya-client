import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useAppNavigation } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";

type VaultRow = {
  id: number;
  kind: "document" | "lease";
  title: string;
  status?: string;
  applicationId?: number;
};

export default function PropertyDocumentsVaultScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [rows, setRows] = useState<VaultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/properties/me/documents/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        setRows([]);
        return;
      }
      const payload = data as {
        application_documents?: Array<{
          id: number;
          document_type: string;
          status: string;
          application?: number;
        }>;
        leases?: Array<{
          id: number;
          document_id?: string;
          status: string;
          application?: number;
        }>;
      };
      const docs: VaultRow[] = (payload.application_documents || []).map((doc) => ({
        id: doc.id,
        kind: "document",
        title: doc.document_type,
        status: doc.status,
        applicationId: doc.application,
      }));
      const leases: VaultRow[] = (payload.leases || []).map((lease) => ({
        id: lease.id,
        kind: "lease",
        title: lease.document_id || `Lease #${lease.id}`,
        status: lease.status,
        applicationId: lease.application,
      }));
      setRows([...docs, ...leases]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <FlatList
        data={rows}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        contentContainerStyle={tw`p-4 pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        ListHeaderComponent={
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-bold text-slate-900`}>{t("documents")}</Text>
            <Text style={tw`text-slate-500 mt-1`}>
              {t("documentsVaultSubtitle", "Application documents and signed leases.")}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={tw`bg-white rounded-2xl border border-slate-200 p-6`}>
            <Text style={tw`text-slate-600`}>{t("noDocumentsRequired")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}
            disabled={!item.applicationId}
            onPress={() => {
              if (!item.applicationId) return;
              navigation.navigate("PropertyApplicationDetail", {
                applicationId: item.applicationId,
              });
            }}
          >
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`font-bold text-slate-900 flex-1`}>{item.title}</Text>
              {item.status ? (
                <Text style={tw`text-xs uppercase text-teal-700`}>{item.status}</Text>
              ) : null}
            </View>
            <Text style={tw`text-xs text-slate-500 mt-1`}>
              {item.kind === "lease" ? t("lease") : t("documents")}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
