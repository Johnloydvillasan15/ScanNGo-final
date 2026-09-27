import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors, radius } from "../theme";
import { Route } from "../types";
import Button from "./Button";

interface Props {
  visible: boolean;
  route: Route | null;
  takenSeats: Set<number>;
  onCancel: () => void;
  onConfirm: (seat: number) => void;
}

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Ported from Future<int?> showSeatPickerDialog() in Testing.dart */
export default function SeatPickerModal({ visible, route, takenSeats, onCancel, onConfirm }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!route) return null;

  const seatsPerRow = 4;
  const totalSeats = route.totalSeats;
  const rows = Math.ceil(totalSeats / seatsPerRow);

  const seatNumbers: number[] = [];
  for (let s = 1; s <= totalSeats; s++) seatNumbers.push(s);

  const rowsOfSeats: number[][] = [];
  for (let r = 0; r < rows; r++) {
    rowsOfSeats.push(seatNumbers.slice(r * seatsPerRow, r * seatsPerRow + seatsPerRow));
  }

  const close = () => {
    setSelected(null);
    onCancel();
  };

  const confirm = () => {
    if (selected == null) return;
    const seat = selected;
    setSelected(null);
    onConfirm(seat);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Select a Seat</Text>
            <Text style={styles.route}>
              {route.origin} → {route.destination}
            </Text>
            <Text style={styles.sub}>Departure: {formatDateTime(route.departureTime)}</Text>

            <View style={styles.grid}>
              {rowsOfSeats.map((row, ri) => (
                <View key={ri} style={styles.row}>
                  {row.slice(0, 2).map((seat) => (
                    <SeatCell
                      key={seat}
                      seat={seat}
                      taken={takenSeats.has(seat)}
                      selected={selected === seat}
                      onPress={() => setSelected(seat)}
                    />
                  ))}
                  <View style={styles.aisle} />
                  {row.slice(2, 4).map((seat) => (
                    <SeatCell
                      key={seat}
                      seat={seat}
                      taken={takenSeats.has(seat)}
                      selected={selected === seat}
                      onPress={() => setSelected(seat)}
                    />
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: colors.card, borderColor: colors.border }]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: colors.accentOrange + "33", borderColor: colors.accentOrange },
                  ]}
                />
                <Text style={styles.legendText}>Taken</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Button text="Cancel" variant="outline" onPress={close} style={{ flex: 1, marginRight: 8 }} />
              <Button
                text="Confirm"
                onPress={confirm}
                disabled={selected == null}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SeatCell({
  seat,
  taken,
  selected,
  onPress,
}: {
  seat: number;
  taken: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const bg = taken
    ? colors.accentOrange + "33"
    : selected
    ? colors.primary
    : colors.cardAlt;
  const border = taken ? colors.accentOrange : colors.border;
  const textColor = selected ? colors.textOnDark : taken ? colors.accentOrange : colors.text;

  return (
    <Pressable
      disabled={taken}
      onPress={onPress}
      style={[styles.seat, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={{ color: textColor, fontWeight: "700" }}>{seat}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, maxHeight: "85%" },
  title: { fontSize: 18, fontWeight: "bold", color: colors.text },
  route: { fontSize: 15, fontWeight: "500", color: colors.text, marginTop: 12 },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 14 },
  grid: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  aisle: { width: 20 },
  seat: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legendRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 16, height: 16, borderRadius: 4, borderWidth: 1 },
  legendText: { fontSize: 12, color: colors.textSecondary },
  actions: { flexDirection: "row", marginTop: 18 },
});
