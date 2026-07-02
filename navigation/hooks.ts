import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./navigation";

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useAppNavigation(): AppNavigationProp {
  return useNavigation<AppNavigationProp>();
}

export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}
