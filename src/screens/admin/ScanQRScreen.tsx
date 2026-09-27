import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../../theme";
import { BookingDatabase } from "../../data/BookingDatabase";
import { Booking } from "../../types";
import Button from "../../components/Button";
import InfoRow from "../../components/InfoRow";

/**
 * Ported from lib/Admin/pages/ScanQRScreen.dart. The Flutter version was a
 * placeholder screen; this fills it in with a working camera scanner since
 * TicketQRScreen.tsx now actually encodes a lookup-able booking QR.
 */
export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<Booking | null | "not_found">(null);

  const onScanned = async ({ data }: { data: string }) => {
    if (!scanning) return;
    setScanning(false);
    try {
      const parsed = JSON.parse(data);
      const booking = parsed?.bookingId ? await BookingDatabase.getById(parsed.bookingId) : null;
      setResult(booking ?? "not_found");
    } catch {
      setResult("not_found");
    }
  };

  const scanAgain = () => {
    setResult(null);
    setScanning(true);
  };

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.permissionText}>Camera access is needed to scan ticket QR codes.</Text>
        <Button text="Grant Camera Access" onPress={requestPermission} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {scanning ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onScanned}
        />
      ) : (
        <View style={styles.resultBox}>
          {result === "not_found" ? (
            <>
              <Ionicons name="close-circle-outline" size={48} color={colors.danger} />
              <Text style={styles.resultTitle}>Ticket not found</Text>
              <Text style={styles.resultSub}>This QR code doesn't match any booking.</Text>
            </>
          ) : result ? (
            <>
              <Ionicons
                name={result.status === "paid" ? "checkmark-circle" : "alert-circle"}
                size={48}
                color={result.status === "paid" ? colors.success : colors.warning}
              />
              <Text style={styles.resultTitle}>
                {result.origin} → {result.destination}
              </Text>
              <View style={{ marginTop: 12, width: "100%" }}>
                <InfoRow icon="person-outline" text={`Seat: #${result.seatNumber}`} />
                <InfoRow icon="mail-outline" text={result.email} />
                <InfoRow icon="bus-outline" text={`Plate Number: ${result.plateNumber}`} />
                <InfoRow
                  icon={result.status === "paid" ? "checkmark-circle-outline" : "alert-circle-outline"}
                  text={`Status: ${result.status === "paid" ? "Paid" : "Payment Pending"}`}
                />
              </View>
            </>
          ) : null}
          <Button text="Scan Another Ticket" onPress={scanAgain} style={{ marginTop: 20 }} />
        </View>
      )}

      {scanning && (
        <View style={styles.overlayHint}>
          <Text style={styles.overlayHintText}>Point the camera at a passenger's ticket QR code</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: colors.bg },
  permissionText: { textAlign: "center", color: colors.textSecondary, marginTop: 14, fontSize: 15 },
  overlayHint: { position: "absolute", bottom: 40, left: 20, right: 20, alignItems: "center" },
  overlayHintText: {
    color: "#fff",
    backgroundColor: "#00000099",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    textAlign: "center",
  },
  resultBox: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 14, textAlign: "center" },
  resultSub: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: "center" },
});
