import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, radius } from "../../theme";
import { useAuth } from "../../context/AuthContext";

const TILES: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  screen: string;
}[] = [
  { icon: "add-circle-outline", label: "Add Bus Route", color: "#1E88E5", screen: "AddBusRoute" },
  { icon: "map-outline", label: "Manage Routes", color: "#00897B", screen: "ManageBusRoutes" },
  { icon: "qr-code-outline", label: "Scan QR Code", color: "#6A1B9A", screen: "ScanQR" },
  { icon: "checkmark-circle-outline", label: "Completed Trips", color: "#FB8C00", screen: "CompletedTrips" },
];

/** Ported from lib/Admin/pages/AdminHomeScreen.dart */
export default function AdminHomeScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.grid}>
        {TILES.map((tile) => (
          <Pressable
            key={tile.label}
            style={[styles.tile, { backgroundColor: tile.color }]}
            onPress={() => navigation.navigate(tile.screen)}
          >
            <Ionicons name={tile.icon} size={40} color="#fff" />
            <Text style={styles.tileLabel}>{tile.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.signOut}
        onPress={() =>
          Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => logout() },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  tile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tileLabel: { color: "#fff", fontWeight: "600", fontSize: 15, marginTop: 14, textAlign: "center" },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 30,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
