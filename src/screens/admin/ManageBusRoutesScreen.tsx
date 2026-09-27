import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Modal,
  ScrollView,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, radius } from "../../theme";
import { Route, Booking } from "../../types";
import { adminTicketController } from "../../controllers/AdminTicketController";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import InfoRow from "../../components/InfoRow";

/** Ported from lib/Admin/pages/ManageBusRoutesScreen.dart */
export default function ManageBusRoutesScreen() {
  const navigation = useNavigation<any>();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const [editing, setEditing] = useState<Route | null>(null);

  useEffect(() => {
    adminTicketController.updateAllRouteStatuses();
    const unsub = adminTicketController.subscribeRoutes(setRoutes);
    loadBookings();
    return unsub;
  }, []);

  const loadBookings = async () => {
    try {
      setBookings(await adminTicketController.getAllBookings());
    } catch (e: any) {
      Alert.alert("Failed to load bookings", String(e?.message ?? e));
    }
  };

  const now = Date.now();
  const upcoming = routes.filter((r) => r.departureTime > now && !r.isCompleted);
  const completed = routes.filter(
    (r) => r.isCompleted || r.departureTime + 12 * 3600_000 < now
  );
  const shown = tab === "upcoming" ? upcoming : completed;

  const bookingsFor = (route: Route) => bookings.filter((b) => b.routeId === route.id);

  const confirmDelete = (route: Route, isCompleted: boolean) => {
    Alert.alert(
      "Delete Route",
      isCompleted
        ? "Are you sure you want to delete this completed route? This will also delete all associated bookings."
        : "Are you sure you want to delete this route?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await adminTicketController.deleteRoute(route);
            loadBookings();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.tabBar}>
        <TabButton label="Upcoming" active={tab === "upcoming"} onPress={() => setTab("upcoming")} />
        <TabButton label="Completed" active={tab === "completed"} onPress={() => setTab("completed")} />
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>No routes available</Text>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => {
            const routeBookings = bookingsFor(item);
            const isCompleted = item.isCompleted || item.departureTime + 12 * 3600_000 < now;
            return (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={styles.title} numberOfLines={2}>
                    Route #{index + 1} | {item.origin} → {item.destination}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: isCompleted ? colors.muted : colors.success },
                    ]}
                  >
                    <Text style={styles.badgeText}>{isCompleted ? "Completed" : "Active"}</Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <InfoRow icon="bus-outline" text={`Bus Plate Number: ${item.plateNumber}`} />
                <InfoRow
                  icon="time-outline"
                  text={`Departure: ${new Date(item.departureTime).toLocaleString()}`}
                />
                <InfoRow icon="people-outline" text={`Total Seats: ${item.totalSeats} | Price: ₱${item.price}`} />
                <InfoRow icon="snow-outline" text={`Air Conditioned: ${item.isAircon ? "Yes" : "No"}`} />
                <InfoRow icon="ticket-outline" text={`Bookings: ${routeBookings.length}/${item.totalSeats}`} />

                <View style={styles.actionsRow}>
                  {!isCompleted && (
                    <Button
                      text="Edit"
                      onPress={() => setEditing(item)}
                      style={{ flex: 1, marginRight: 8 }}
                    />
                  )}
                  <Button
                    text="Delete"
                    variant="danger"
                    onPress={() => confirmDelete(item, isCompleted)}
                    style={{ flex: 1 }}
                  />
                </View>
                <Button
                  text="View Bookings"
                  variant="outline"
                  onPress={() => navigation.navigate("ViewBookings", { route: item })}
                  style={{ marginTop: 10 }}
                />
              </View>
            );
          }}
        />
      )}

      <EditRouteModal route={editing} onClose={() => setEditing(null)} />
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    </Pressable>
  );
}

function EditRouteModal({ route, onClose }: { route: Route | null; onClose: () => void }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [isAircon, setIsAircon] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (route) {
      setOrigin(route.origin);
      setDestination(route.destination);
      setSeats(String(route.totalSeats));
      setPrice(String(route.price));
      setIsAircon(route.isAircon);
    }
  }, [route]);

  if (!route) return null;

  const save = async () => {
    setSaving(true);
    try {
      await adminTicketController.updateRoute({
        ...route,
        origin,
        destination,
        totalSeats: parseInt(seats, 10) || route.totalSeats,
        price: parseInt(price, 10) || route.price,
        isAircon,
      });
      Alert.alert("Route updated successfully");
      onClose();
    } catch (e: any) {
      Alert.alert("Error", String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.sheetTitle}>Edit Bus Route</Text>
            <TextField value={origin} onChangeText={setOrigin} placeholder="Origin" style={{ marginTop: 12 }} />
            <TextField
              value={destination}
              onChangeText={setDestination}
              placeholder="Destination"
              style={{ marginTop: 10 }}
            />
            <TextField
              value={seats}
              onChangeText={setSeats}
              placeholder="Total Seats"
              keyboardType="number-pad"
              style={{ marginTop: 10 }}
            />
            <TextField
              value={price}
              onChangeText={setPrice}
              placeholder="Ticket Price"
              keyboardType="number-pad"
              style={{ marginTop: 10 }}
            />
            <View style={styles.switchRow}>
              <Text style={{ color: colors.text }}>Air Conditioned</Text>
              <Switch value={isAircon} onValueChange={setIsAircon} trackColor={{ true: colors.primary }} />
            </View>
            <View style={styles.actionsRow}>
              <Button text="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
              <Button text="Save" onPress={save} loading={saving} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tabBar: { flexDirection: "row", backgroundColor: "#0000000D", borderRadius: radius.md, margin: 16, padding: 4 },
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: "bold", color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  actionsRow: { flexDirection: "row", marginTop: 12 },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, maxHeight: "85%" },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
});
