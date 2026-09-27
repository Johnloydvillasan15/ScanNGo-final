import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { UserTabParamList } from "../types";
import HomeScreen from "../screens/HomeScreen";
import TicketsScreen from "../screens/TicketsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<UserTabParamList>();

/** Ported from lib/base/botton,nav.dart's BottomNavBar */
export default function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: { height: 60, backgroundColor: colors.card },
        tabBarIcon: ({ color, focused }) => {
          const iconMap: Record<string, [string, string]> = {
            Home: ["home", "home-outline"],
            Tickets: ["pricetag", "pricetag-outline"],
            Profile: ["person", "person-outline"],
          };
          const [filled, outline] = iconMap[route.name];
          return (
            <Ionicons name={(focused ? filled : outline) as any} size={24} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
