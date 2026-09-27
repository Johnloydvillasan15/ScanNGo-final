import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { Booking } from "../types";
import { userTicketController } from "../controllers/UserTicketController";
import { useAuth } from "../context/AuthContext";

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Ported from lib/screens/tickets/HistoryPage.dart */
export default function HistoryScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = userTicketController.subscribeMyBookings(user.uid, setBookings);
    return unsub;
  }, [user]);

  if (bookings === null) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
      </View>
    );
  }

  const today = startOfDay(Date.now());
  const completed = bookings.filter((b) => startOfDay(b.departureTime) < today);

  const confirmDelete = (booking: Booking) => {
    Alert.alert("Delete Ticket", "Are you sure you want to delete this ticket?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => userTicketController.deleteBooking(booking.id),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      {completed.length === 0 ? (
        <Text style={styles.empty}>No completed trips yet.</Text>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.route}>
                    {item.origin} → {item.destination}
                  </Text>
                  <Text style={styles.line}>Departure: {formatDateTime(item.departureTime)}</Text>
                  <Text style={styles.line}>Seat: {item.seatNumber}</Text>
                  <Text style={styles.line}>Plate Number: {item.plateNumber}</Text>
                  <Text style={styles.line}>Status: {item.status === "paid" ? "Paid" : "Unpaid"}</Text>
                </View>
                <Pressable onPress={() => confirmDelete(item)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </Pressable>
              </View>
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
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  route: { fontWeight: "bold", fontSize: 15, color: colors.text, marginBottom: 4 },
  line: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
