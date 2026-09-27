import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, radius } from "../theme";
import { Route } from "../types";
import InfoRow from "./InfoRow";
import Button from "./Button";

interface Props {
  visible: boolean;
  route: Route | null;
  seat: number | null;
  busy: boolean;
  onClose: () => void;
  onConfirmBooking: () => void;
  onProceedToPayment: () => void;
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

/** Ported from Future<void> _showPaymentDialog() in Testing.dart */
export default function PaymentModal({
  visible,
  route,
  seat,
  busy,
  onClose,
  onConfirmBooking,
  onProceedToPayment,
}: Props) {
  if (!route || seat == null) return null;
  const amount = Math.max(route.price, 20);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Payment Details</Text>

            <View style={{ marginTop: 12 }}>
              <InfoRow icon="cash-outline" text={`Price: ₱${route.price}`} />
              {route.price < 20 && (
                <InfoRow icon="information-circle-outline" text="Minimum payment of ₱20 applied for processing" />
              )}
              <InfoRow icon="person-outline" text={`Seat: #${seat}`} />
              <InfoRow icon="navigate-outline" text={`Route: ${route.origin} → ${route.destination}`} />
              <InfoRow icon="time-outline" text={`Departure: ${formatDateTime(route.departureTime)}`} />
              <InfoRow icon="snow-outline" text={`Aircon: ${route.isAircon ? "Yes" : "No"}`} />
            </View>

            <Text style={styles.total}>Total: ₱{amount}</Text>

            <View style={styles.actions}>
              <Button text="Close" variant="outline" onPress={onClose} disabled={busy} />
              <Button
                text="Confirm Booking"
                onPress={onConfirmBooking}
                loading={busy}
                style={{ marginTop: 10 }}
              />
              <Button
                text="Proceed to Payment (simulate pay)"
                onPress={onProceedToPayment}
                variant="outline"
                loading={busy}
                style={{ marginTop: 10 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, maxHeight: "85%" },
  title: { fontSize: 18, fontWeight: "bold", color: colors.text },
  total: { fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 14 },
  actions: { marginTop: 18 },
});
