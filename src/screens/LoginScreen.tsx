import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import TextField from "../components/TextField";
import Button from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

/** Ported from lib/pages/login_page.dart */
export default function LoginScreen({ navigation }: Props) {
  const { login, error, clearError } = useAuth();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    clearError();
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      // error surfaced via context
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: width * 0.05 }}>
        <View style={{ height: height * 0.08 }} />
        <View style={styles.logoCircle}>
          <Ionicons name="bus" size={48} color={colors.textOnDark} />
        </View>
        <Text style={styles.brand}>Scan & Go</Text>
        <Text style={styles.tagline}>Your Partner in Safe and Convenient Travel.</Text>

        <View style={{ height: 24 }} />
        <TextField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={{ height: 12 }} />
        <TextField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ height: 24 }} />
        <Button text="Sign In" onPress={signIn} loading={loading} />

        <View style={{ height: 24 }} />
        <View style={styles.row}>
          <Text style={styles.muted}>Not a member? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Signup")}>
            Register Now
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { textAlign: "center", color: colors.text, fontSize: 24, fontWeight: "bold", marginTop: 14 },
  tagline: { textAlign: "center", color: colors.textSecondary, fontSize: 16, marginTop: 8 },
  error: { color: colors.danger, marginTop: 10, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "center" },
  muted: { color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: "bold" },
});
