import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, radius } from "../../theme";
import { adminTicketController } from "../../controllers/AdminTicketController";
import TextField from "../../components/TextField";
import Button from "../../components/Button";

/** Ported from lib/Admin/pages/AddBusRouteScreen.dart */
export default function AddBusRouteScreen({ navigation }: any) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [isAircon, setIsAircon] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);
  const [saving, setSaving] = useState(false);

  const onPickerChange = (_: any, selected?: Date) => {
    const mode = showPicker;
    setShowPicker(null);
    if (!selected) return;
    if (mode === "date") {
      const merged = new Date(dateTime);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDateTime(merged);
      // chain into a time picker, matching the Flutter flow (date, then time)
      setTimeout(() => setShowPicker("time"), Platform.OS === "android" ? 250 : 0);
    } else if (mode === "time") {
      const merged = new Date(dateTime);
      merged.setHours(selected.getHours(), selected.getMinutes());
      setDateTime(merged);
    }
  };

  const submit = async () => {
    const totalSeats = parseInt(seats, 10);
    const ticketPrice = parseInt(price, 10);

    if (!origin || !destination || !plateNumber || isNaN(totalSeats) || isNaN(ticketPrice)) {
      Alert.alert("Please fill all fields correctly before submitting.");
      return;
    }

    setSaving(true);
    try {
      await adminTicketController.uploadRoute({
        origin,
        destination,
        departureTime: dateTime.getTime(),
        totalSeats,
        price: ticketPrice,
        isAircon,
        isCompleted: false,
        isReadyForDeparture: false,
        plateNumber,
      });
      Alert.alert("Bus Route Added Successfully");
      setOrigin("");
      setDestination("");
      setPlateNumber("");
      setSeats("");
      setPrice("");
      setIsAircon(false);
      setDateTime(new Date());
    } catch (e: any) {
      Alert.alert("Error", String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Starting Point (Origin)</Text>
      <TextField value={origin} onChangeText={setOrigin} placeholder="e.g. Davao City" />

      <Text style={styles.label}>Destination</Text>
      <TextField value={destination} onChangeText={setDestination} placeholder="e.g. Tagum City" />

      <Text style={styles.label}>Bus Plate Number</Text>
      <TextField value={plateNumber} onChangeText={setPlateNumber} placeholder="e.g. ABC 1234" />

      <Text style={styles.label}>Departure</Text>
      <Button
        text={`Departure: ${dateTime.toLocaleString(undefined, {
          month: "numeric",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        variant="outline"
        onPress={() => setShowPicker("date")}
      />
      {showPicker && (
        <DateTimePicker
          value={dateTime}
          mode={showPicker}
          is24Hour={false}
          minimumDate={showPicker === "date" ? new Date() : undefined}
          onChange={onPickerChange}
        />
      )}

      <Text style={styles.label}>Total Seats</Text>
      <TextField value={seats} onChangeText={setSeats} keyboardType="number-pad" placeholder="e.g. 20" />

      <Text style={styles.label}>Ticket Price (₱)</Text>
      <TextField value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="e.g. 150" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Air-conditioned Bus</Text>
        <Switch value={isAircon} onValueChange={setIsAircon} trackColor={{ true: colors.primary }} />
      </View>

      <Button text="Add Route" onPress={submit} loading={saving} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: 16, marginBottom: 6 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
});
