import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import AddBusRouteScreen from "../screens/admin/AddBusRouteScreen";
import ManageBusRoutesScreen from "../screens/admin/ManageBusRoutesScreen";
import ViewBookingsScreen from "../screens/admin/ViewBookingsScreen";
import CompletedTripsScreen from "../screens/admin/CompletedTripsScreen";
import ScanQRScreen from "../screens/admin/ScanQRScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Ported from lib/Admin/pages/*.dart navigation (pushed via MaterialPageRoute) */
export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.appBar },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="AddBusRoute" component={AddBusRouteScreen} options={{ title: "Add Bus Route" }} />
      <Stack.Screen
        name="ManageBusRoutes"
        component={ManageBusRoutesScreen}
        options={{ title: "Manage Bus Routes" }}
      />
      <Stack.Screen name="ViewBookings" component={ViewBookingsScreen} options={{ title: "Bookings" }} />
      <Stack.Screen
        name="CompletedTrips"
        component={CompletedTripsScreen}
        options={{ title: "Completed Bus Travels" }}
      />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: "QR Ticket Scanner" }} />
    </Stack.Navigator>
  );
}
