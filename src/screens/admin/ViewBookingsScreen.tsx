import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radius } from "../../theme";
import { RootStackParamList, Booking } from "../../types";
import { BookingDatabase } from "../../data/BookingDatabase";

type Props = NativeStackScreenProps<RootStackParamList, "ViewBookings">;

/** Ported from lib/Admin/pages/ViewBookingsScreen.dart */
export default function ViewBookingsScreen({ route: navRoute }: Props) {
  const { route } = navRoute.params;
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    BookingDatabase.getAllForRoute(route.id).then(setBookings);
  }, [route.id]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>
        Bookings for {route.origin} → {route.destination}
      </Text>

      {bookings === null ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} />
      ) : bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings for this route.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.seat}>Seat: {item.seatNumber}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <Text style={styles.paid}>{item.status === "paid" ? `Paid: ₱${route.price}` : "Unpaid"}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 12 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 30 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  seat: { fontWeight: "600", color: colors.text },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  paid: { fontSize: 13, color: colors.textSecondary },
});
