import React, { ReactNode } from "react";
import { SafeAreaView, StyleSheet, View, ImageBackground } from "react-native";
import Constants from "expo-constants";

export default function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style: any;
}) {
  return (
    <SafeAreaView style={[styles.container, style]}>
     
        <View style={[styles.view, style]}>{children}</View>
   
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
  },
  view: {
    // flex: 1
  },
});
