import React from "react";
import { View, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import colors from "../configs/colors";
import { Ionicons } from "@expo/vector-icons";

interface TabCartButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const TabCartButton: React.FC<TabCartButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Ionicons name="md-cart" color={colors.primary} size={27} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    height: 60,
    width: 60,
    borderRadius: 30,
    bottom: 30,
    borderColor: colors.light,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabCartButton;
