import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

/** Ported from lib/screens/person/profile_screen.dart */
export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();

  const signUserOut = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        logout();
      }
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{profile?.name ?? "Passenger"}</Text>
        <Text style={styles.email}>{user?.email ?? "No email"}</Text>
      </View>

      <Pressable style={styles.signOutRow} onPress={signUserOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.text, marginTop: 12 },
  center: { alignItems: "center", marginTop: 30, marginBottom: 30 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.steelBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 14 },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  signOutText: { color: colors.danger, fontWeight: "600", fontSize: 15 },
});