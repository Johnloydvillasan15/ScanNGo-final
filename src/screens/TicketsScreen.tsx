import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { Booking } from "../types";
import { userTicketController } from "../controllers/UserTicketController";
import { checkoutController } from "../controllers/CheckoutController";
import { BookingDatabase } from "../data/BookingDatabase";
import { useAuth } from "../context/AuthContext";
import InfoRow from "../components/InfoRow";
import Button from "../components/Button";

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Ported from lib/screens/tickets/ticket_screen.dart */
export default function TicketsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState<"ongoing" | "completed">("ongoing");

  useEffect(() => {
    if (!user) return;
    const unsub = userTicketController.subscribeMyBookings(user.uid, setBookings);
    return unsub;
  }, [user]);

  if (bookings === null) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const today = startOfDay(Date.now());
  const ongoing = bookings.filter((b) => startOfDay(b.departureTime) >= today);
  const completed = bookings.filter((b) => startOfDay(b.departureTime) < today);
  const shown = tab === "ongoing" ? ongoing : completed;

  const payNow = async (booking: Booking) => {
    try {
      try {
        await checkoutController.markPaid(booking.checkoutId);
      } catch {
        // in-memory mock session may have expired (e.g. app restart) — the
        // booking's own status is the source of truth, so proceed anyway.
      }
      await BookingDatabase.markPaid(booking.id);
    } catch (e: any) {
      Alert.alert("Payment failed", String(e?.message ?? e));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Tickets</Text>
        <Pressable onPress={() => navigation.navigate("History")} hitSlop={10}>
          <Ionicons name="time-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Ongoing" active={tab === "ongoing"} onPress={() => setTab("ongoing")} />
        <TabButton label="Completed" active={tab === "completed"} onPress={() => setTab("completed")} />
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>No tickets found</Text>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View>
              <Pressable onPress={() => navigation.navigate("TicketQR", { booking: item })}>
                <TicketCard booking={item} />
              </Pressable>
              {item.status === "pending" && (
                <Button
                  text="Pay Now (simulate)"
                  onPress={() => payNow(item)}
                  style={{ marginTop: -6, marginBottom: 14 }}
                />
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TicketCard({ booking }: { booking: Booking }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.ticketId} numberOfLines={1}>
          Ticket #{booking.id}
        </Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: booking.status === "paid" ? colors.successBg : colors.warningBg },
          ]}
        >
          <Text
            style={{
              color: booking.status === "paid" ? colors.success : colors.warning,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {booking.status === "paid" ? "Payment Successful" : "Payment Pending"}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <InfoRow icon="navigate-outline" text={`Route: ${booking.origin} → ${booking.destination}`} />
      <InfoRow icon="time-outline" text={`Departure: ${formatDateTime(booking.departureTime)}`} />
      <InfoRow icon="person-outline" text={`Seat: #${booking.seatNumber}`} />
      <InfoRow icon="cash-outline" text={`Ticket Price: ₱${booking.price}`} />
      <InfoRow icon="snow-outline" text={`Aircon: ${booking.isAircon ? "Yes" : "No"}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: colors.text },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0000000D",
    borderRadius: radius.md,
    margin: 16,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: "center" },
  tabBtnActive: { backgroundColor: colors.card },
  tabBtnText: { color: colors.textSecondary, fontWeight: "500" },
  tabBtnTextActive: { color: colors.primary, fontWeight: "700" },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  ticketId: { flex: 1, fontWeight: "bold", fontSize: 15, color: colors.text },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
});
