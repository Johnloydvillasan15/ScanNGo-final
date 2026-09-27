import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export default function InfoRow({ icon, text }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 3, gap: 8 },
  text: { fontSize: 13.5, color: colors.textSecondary, flexShrink: 1 },
});
