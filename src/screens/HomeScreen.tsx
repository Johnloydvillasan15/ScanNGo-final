import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { colors } from "../theme";
import { Route } from "../types";
import { adminTicketController } from "../controllers/AdminTicketController";
import { userTicketController } from "../controllers/UserTicketController";
import { checkoutController } from "../controllers/CheckoutController";
import { ticketService } from "../services/TicketService";
import { BookingDatabase } from "../data/BookingDatabase";
import { useAuth } from "../context/AuthContext";
import RouteCard from "../components/RouteCard";
import SeatPickerModal from "../components/SeatPickerModal";
import PaymentModal from "../components/PaymentModal";

/**
 * Ported from lib/pages/Testing.dart — this is Paw Patrol's real, active home
 * screen (the commented-out screens/home/home_screen.dart was dead code).
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [takenCounts, setTakenCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [seatPickerRoute, setSeatPickerRoute] = useState<Route | null>(null);
  const [takenSeats, setTakenSeats] = useState<Set<number>>(new Set());

  const [paymentRoute, setPaymentRoute] = useState<Route | null>(null);
  const [paymentSeat, setPaymentSeat] = useState<number | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentPollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = adminTicketController.subscribeRoutes(
      (all) => {
        setRoutes(all);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const refreshTakenCounts = useCallback(async () => {
    const entries = await Promise.all(
      routes.map(async (r) => {
        const taken = await ticketService.getTakenSeats(r);
        return [r.id, taken.size] as const;
      })
    );
    setTakenCounts(Object.fromEntries(entries));
  }, [routes]);

  useEffect(() => {
    refreshTakenCounts();
  }, [refreshTakenCounts]);

  // Ported from Testing.dart's _scheduleStatusUpdates() — recheck every minute
  // whether a route's departure has passed, and flip it to completed.
  useEffect(() => {
    statusTimer.current = setInterval(() => {
      adminTicketController.updateAllRouteStatuses();
    }, 60_000);
    return () => {
      if (statusTimer.current) clearInterval(statusTimer.current);
    };
  }, []);

  // Ported from main.dart's Timer.periodic(30s) -> autoUpdateController().
  useEffect(() => {
    if (!user) return;
    paymentPollTimer.current = setInterval(() => {
      userTicketController.autoUpdatePendingPayments(user.uid);
    }, 30_000);
    return () => {
      if (paymentPollTimer.current) clearInterval(paymentPollTimer.current);
    };
  }, [user]);

  const upcomingRoutes = routes.filter(
    (r) => r.departureTime > Date.now() - 60 * 60_000 && !r.isCompleted
  );

  const openSeatPicker = async (route: Route) => {
    const taken = await ticketService.getTakenSeats(route);
    setTakenSeats(taken);
    setSeatPickerRoute(route);
  };

  const onSeatConfirmed = (seat: number) => {
    const route = seatPickerRoute;
    setSeatPickerRoute(null);
    if (!route) return;
    setPaymentRoute(route);
    setPaymentSeat(seat);
  };

  const closePayment = () => {
    setPaymentRoute(null);
    setPaymentSeat(null);
  };

  // Ported from the "Confirm Booking" button — books the seat as unpaid.
  const confirmBooking = async () => {
    if (!user || !paymentRoute || paymentSeat == null) return;
    setPaymentBusy(true);
    try {
      await userTicketController.bookAndCheckout({
        route: paymentRoute,
        userId: user.uid,
        email: user.email ?? "",
        seat: paymentSeat,
      });
      closePayment();
      Alert.alert("Ticket booked successfully!", "Please complete the payment from My Tickets.");
      refreshTakenCounts();
    } catch (e: any) {
      Alert.alert("Error creating payment", String(e?.message ?? e));
    } finally {
      setPaymentBusy(false);
    }
  };

  // Ported from the "Proceed to Payment" button. The Flutter app opened the
  // real PayMongo checkout URL in a browser; since payments here are mocked
  // locally, this books the seat and immediately simulates a successful pay.
  const proceedToPayment = async () => {
    if (!user || !paymentRoute || paymentSeat == null) return;
    setPaymentBusy(true);
    try {
      const { bookingId, checkoutId } = await userTicketController.bookAndCheckout({
        route: paymentRoute,
        userId: user.uid,
        email: user.email ?? "",
        seat: paymentSeat,
      });
      await checkoutController.markPaid(checkoutId);
      await BookingDatabase.markPaid(bookingId);
      closePayment();
      Alert.alert("Payment successful!", "Your ticket is confirmed. Find it under My Tickets.");
      refreshTakenCounts();
    } catch (e: any) {
      Alert.alert("Error creating payment", String(e?.message ?? e));
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan & Go</Text>
      </View>
      <Text style={styles.subtitle}>Available Bus Trips</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} size="large" />
      ) : upcomingRoutes.length === 0 ? (
        <Text style={styles.empty}>No routes available</Text>
      ) : (
        <FlatList
          data={upcomingRoutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <RouteCard
              route={item}
              index={index}
              takenSeats={takenCounts[item.id] ?? 0}
              onBook={() => openSeatPicker(item)}
            />
          )}
        />
      )}

      <SeatPickerModal
        visible={!!seatPickerRoute}
        route={seatPickerRoute}
        takenSeats={takenSeats}
        onCancel={() => setSeatPickerRoute(null)}
        onConfirm={onSeatConfirmed}
      />

      <PaymentModal
        visible={!!paymentRoute && paymentSeat != null}
        route={paymentRoute}
        seat={paymentSeat}
        busy={paymentBusy}
        onClose={closePayment}
        onConfirmBooking={confirmBooking}
        onProceedToPayment={proceedToPayment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.appBar, paddingVertical: 16, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  subtitle: { fontSize: 20, fontWeight: "bold", color: colors.text, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 16 },
});
