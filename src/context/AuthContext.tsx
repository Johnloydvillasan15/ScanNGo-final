import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile } from "../types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mirrors Auth.dart's StreamBuilder<User?> gate: this is the app's Firebase
// auth-state listener, feeding AppNavigator whether to show Login/Signup,
// the user tabs, or (once role is known) the admin dashboard.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        } catch (e) {
          console.warn("Error loading profile:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Ported from login_page.dart's signUserIn().
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      const code = e?.code ?? "";
      let message = "An unexpected error occurred.";
      if (code === "auth/user-not-found") message = "No user found for that email.";
      else if (code === "auth/wrong-password") message = "Wrong password provided.";
      else if (code === "auth/invalid-credential") message = "Invalid email or password.";
      setError(message);
      throw new Error(message);
    }
  };

  // Ported from register.dart's signUserUp() — it creates the account, writes
  // the profile doc, then signs the user back out so they log in deliberately.
  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name,
        email: email.trim(),
        role: "user",
        createdAt: Date.now(),
      };
      await setDoc(doc(db, "users", cred.user.uid), {
        ...newProfile,
        createdAt: Timestamp.now(),
      });
      await signOut(auth);
    } catch (e: any) {
      const code = e?.code ?? "";
      let message = "An unexpected error occurred.";
      if (code === "auth/email-already-in-use") message = "Email is already in use.";
      else if (code === "auth/weak-password") message = "Password should be at least 6 characters.";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => signOut(auth);
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
