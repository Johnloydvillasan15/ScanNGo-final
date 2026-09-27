import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../../theme";
import { Route } from "../../types";
import { adminTicketController } from "../../controllers/AdminTicketController";

/** Ported from lib/Admin/pages/MarkTripCompletedScreen.dart's CompletedBusRoutesScreen */
export default function CompletedTripsScreen() {
  const [routes, setRoutes] = useState<Route[] | null>(null);

  useEffect(() => {
    const unsub = adminTicketController.subscribeRoutes(async (all) => {
      const now = Date.now();
      for (const route of all) {
        if (route.departureTime < now && !route.isCompleted) {
          await adminTicketController.updateCompletedStatus(route.id, true);
        }
      }
      setRoutes(all.filter((r) => r.isCompleted || r.departureTime < now));
    });
    return unsub;
  }, []);

  const confirmDelete = (route: Route) => {
    Alert.alert("Delete Route", "Are you sure you want to delete this completed route?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await adminTicketController.deleteRoute(route);
        },
      },
    ]);
  };

  if (routes === null) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {routes.length === 0 ? (
        <Text style={styles.empty}>No completed bus travels.</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Route: {item.origin} → {item.destination}
                </Text>
                <Text style={styles.line}>
                  Departure: {new Date(item.departureTime).toLocaleString()}
                </Text>
                <Text style={styles.line}>Price: ₱{item.price}</Text>
                <Text style={styles.line}>Aircon: {item.isAircon ? "Yes" : "No"}</Text>
                <Text style={styles.status}>✅ Completed</Text>
              </View>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  title: { fontWeight: "600", color: colors.text, marginBottom: 6 },
  line: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  status: { marginTop: 6, color: colors.success, fontWeight: "600" },
});
