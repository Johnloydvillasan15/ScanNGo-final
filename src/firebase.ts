import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  // @ts-ignore - getReactNativePersistence exists at runtime but is missing from firebase/auth's TS types
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ================= FIREBASE CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyDshsY7fzgQO9CpVZfG22FUzvYkVu2ntI4",
  authDomain: "reactnativesgo.firebaseapp.com",
  projectId: "reactnativesgo",
  storageBucket: "reactnativesgo.firebasestorage.app",
  messagingSenderId: "256900828185",
  appId: "1:256900828185:web:329d8f51484ec3020b6e88",
  measurementId: "G-DRBVT4HKR5"
};

// ================= INITIALIZE FIREBASE =================

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

// ================= AUTH =================

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// ================= FIRESTORE =================

export const db = getFirestore(app);