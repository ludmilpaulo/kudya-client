import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import { detectDeviceLanguage, type SupportedLocale } from "../../configs/i18n";
import { useTranslation } from "../../hooks/useTranslation";

const MODE_KEY = "@kudya/language_mode";

const PRIMARY: { code: SupportedLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export default function PropertyLanguageCard() {
  const { t, languageCode, setLanguage } = useTranslation();
  const [mode, setMode] = useState<"auto" | "manual">("manual");

  useEffect(() => {
    void AsyncStorage.getItem(MODE_KEY).then((value) => {
      if (value === "auto") setMode("auto");
    });
  }, []);

  const chooseAutomatic = () => {
    setMode("auto");
    void AsyncStorage.setItem(MODE_KEY, "auto");
    void setLanguage(detectDeviceLanguage());
  };

  const choose = (code: SupportedLocale) => {
    setMode("manual");
    void AsyncStorage.setItem(MODE_KEY, "manual");
    void setLanguage(code);
  };

  const Row = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={tw`flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
        active ? "bg-violet-600" : "bg-transparent"
      }`}
    >
      <Text style={tw`${active ? "text-white font-semibold" : "text-slate-800"} text-sm`}>{label}</Text>
      {active ? <Text style={tw`text-white font-bold`}>✓</Text> : null}
    </Pressable>
  );

  return (
    <View style={tw`bg-white rounded-2xl border border-violet-100 p-4 mb-4`}>
      <Text style={tw`text-xs font-bold uppercase tracking-wide text-violet-700`}>
        {t("languageSettings", "Language")}
      </Text>
      <View style={tw`mt-2`}>
        <Row label={t("languageAutomatic", "Automatic")} active={mode === "auto"} onPress={chooseAutomatic} />
        {PRIMARY.map((item) => (
          <Row
            key={item.code}
            label={item.label}
            active={mode === "manual" && languageCode === item.code}
            onPress={() => choose(item.code)}
          />
        ))}
        <Row
          label="Español"
          active={mode === "manual" && languageCode === "es"}
          onPress={() => choose("es")}
        />
      </View>
      <Text style={tw`mt-3 pt-3 border-t border-violet-100 text-sm text-slate-600`}>
        {t("findYourNextHome", "Find your next home")}
      </Text>
    </View>
  );
}
