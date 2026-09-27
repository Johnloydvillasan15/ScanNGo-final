import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import TicketQRScreen from "../screens/TicketQRScreen";
import HistoryScreen from "../screens/HistoryScreen";
import UserTabs from "./UserTabs";
import AdminNavigator from "./AdminNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

/** Ported from lib/pages/auth.dart's Auth widget (StreamBuilder<User?> gate) */
export default function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      ) : profile?.role === "admin" ? (
        <AdminNavigator />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="TicketQR"
            component={TicketQRScreen}
            options={{
              title: "Your Ticket",
              headerStyle: { backgroundColor: colors.appBar },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: "Bus Ticket History",
              headerStyle: { backgroundColor: colors.appBar },
              headerTintColor: "#fff",
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
