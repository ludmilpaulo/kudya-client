import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import tw from "twrnc";
import { theme } from "../../configs/theme";

export function KudyaSkeleton() {
  return <View style={tw`h-24 rounded-2xl bg-slate-200`} />;
}

export function KudyaEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={tw`rounded-2xl bg-white p-4 border border-slate-200`}>
      <Text style={tw`text-base font-semibold text-slate-900`}>{title}</Text>
      <Text style={tw`mt-1 text-sm text-slate-600`}>{body}</Text>
    </View>
  );
}

export function KudyaErrorState({
  title,
  body,
  onRetry,
  retryLabel,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel: string;
}) {
  return (
    <View style={tw`rounded-2xl bg-white p-4 border border-red-200`}>
      <Text style={tw`text-base font-semibold text-red-700`}>{title}</Text>
      <Text style={tw`mt-1 text-sm text-slate-600`}>{body}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[tw`mt-3 self-start rounded-full px-4 py-2`, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={tw`text-white font-semibold`}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function KudyaLoading() {
  return <ActivityIndicator color={theme.colors.primary} />;
}
