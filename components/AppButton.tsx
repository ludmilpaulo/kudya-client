import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import colors from "../configs/colors";

interface MyButtonProps {
  title: string;
  onPress: () => void;
  color?: keyof typeof colors; // Color should be one of the keys in the 'colors' object
  disabled?: boolean;
}

const AppButton: React.FC<MyButtonProps> = ({
  title,
  onPress,
  color = "primary",
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors[color] }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginVertical: 5,
    marginTop: 15,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AppButton;
