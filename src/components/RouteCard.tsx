import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../theme";
import { Route } from "../types";
import InfoRow from "./InfoRow";
import Button from "./Button";

interface Props {
  route: Route;
  index: number;
  takenSeats: number;
  onBook: () => void;
}

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

/** Ported from the Card widget built inside _buildRouteList() in Testing.dart */
export default function RouteCard({ route, index, takenSeats, onBook }: Props) {
  const isFullyBooked = takenSeats >= route.totalSeats;
  const minutesToDeparture = (route.departureTime - Date.now()) / 60000;
  const isReady = route.isReadyForDeparture || minutesToDeparture <= 10;
  const canBook = !isFullyBooked && !isReady;

  const badge = isReady ? "Ready" : isFullyBooked ? "Full" : "Available";
  const badgeColor = isReady ? colors.accentOrange : isFullyBooked ? colors.muted : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.routeIndex}>Route #{index + 1}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor + "33" }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      </View>

      <Text style={styles.title}>
        {route.origin} → {route.destination}
      </Text>

      <View style={styles.divider} />

      <InfoRow icon="time-outline" text={`Departure: ${formatDateTime(route.departureTime)}`} />
      <InfoRow
        icon="people-outline"
        text={`Available Seats: ${Math.max(route.totalSeats - takenSeats, 0)}/${route.totalSeats}`}
      />
      <InfoRow icon="cash-outline" text={`Price: ₱${route.price}`} />
      <InfoRow icon="snow-outline" text={`Aircon: ${route.isAircon ? "Yes" : "No"}`} />
      <InfoRow icon="bus-outline" text={`Plate Number: ${route.plateNumber}`} />

      <Button
        text={isReady ? "Ready for Departure" : isFullyBooked ? "Fully Booked" : "Book Ticket"}
        onPress={onBook}
        disabled={!canBook}
        variant={canBook ? "primary" : "muted"}
        style={{ marginTop: 14 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routeIndex: { fontSize: 13, color: colors.textSecondary },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
});
