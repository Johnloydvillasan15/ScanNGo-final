import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import TextField from "../components/TextField";
import Button from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

/** Ported from lib/pages/register.dart */
export default function SignupScreen({ navigation }: Props) {
  const { signup, error, clearError } = useAuth();
  const { width, height } = useWindowDimensions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    clearError();
    if (password !== confirm) {
      Alert.alert("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      Alert.alert("Account created", "You can now sign in.");
      navigation.navigate("Login");
    } catch {
      // error surfaced via context
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: width * 0.05 }}>
        <View style={{ height: height * 0.06 }} />
        <View style={styles.logoCircle}>
          <Ionicons name="bus" size={40} color={colors.textOnDark} />
        </View>
        <Text style={styles.tagline}>Your Partner in Safe and Convenient Travel.</Text>

        <View style={{ height: 20 }} />
        <TextField placeholder="Full Name" value={name} onChangeText={setName} />
        <View style={{ height: 12 }} />
        <TextField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={{ height: 12 }} />
        <TextField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={{ height: 12 }} />
        <TextField
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ height: 24 }} />
        <Button text="Sign Up" onPress={signUp} loading={loading} />

        <View style={{ height: 24 }} />
        <View style={styles.row}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Login Now
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: { textAlign: "center", color: colors.textSecondary, fontSize: 15, marginTop: 14 },
  error: { color: colors.danger, marginTop: 10, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "center" },
  muted: { color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: "bold" },
});
