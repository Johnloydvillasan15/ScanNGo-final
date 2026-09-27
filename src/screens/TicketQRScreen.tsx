import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radius } from "../theme";
import { RootStackParamList } from "../types";
import InfoRow from "../components/InfoRow";

type Props = NativeStackScreenProps<RootStackParamList, "TicketQR">;

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

/** Ported from lib/screens/home/QrCodeScreen.dart */
export default function TicketQRScreen({ route }: Props) {
  const { booking } = route.params;
  const qrData = JSON.stringify({
    bookingId: booking.id,
    routeId: booking.routeId,
    seat: booking.seatNumber,
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ alignItems: "center", padding: 24 }}>
      <View style={styles.qrCard}>
        <QRCode value={qrData} size={220} color={colors.text} backgroundColor={colors.card} />
      </View>

      <Text style={styles.route}>
        {booking.origin} → {booking.destination}
      </Text>

      <View style={styles.details}>
        <InfoRow icon="person-outline" text={`Seat: #${booking.seatNumber}`} />
        <InfoRow icon="time-outline" text={`Departure: ${formatDateTime(booking.departureTime)}`} />
        <InfoRow icon="bus-outline" text={`Plate Number: ${booking.plateNumber}`} />
        <InfoRow icon="snow-outline" text={`Aircon: ${booking.isAircon ? "Yes" : "No"}`} />
        <InfoRow icon="cash-outline" text={`Price: ₱${booking.price}`} />
        <InfoRow
          icon={booking.status === "paid" ? "checkmark-circle-outline" : "alert-circle-outline"}
          text={`Status: ${booking.status === "paid" ? "Paid" : "Payment Pending"}`}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  qrCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  route: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 20 },
  details: { width: "100%", marginTop: 18, backgroundColor: colors.card, borderRadius: radius.md, padding: 16 },
});
