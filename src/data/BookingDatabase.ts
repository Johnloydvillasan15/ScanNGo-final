import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Booking } from "../types";

const bookingsCol = collection(db, "bookings");

function fromDoc(d: QueryDocumentSnapshot<DocumentData>): Booking {
  return fromData(d.id, d.data());
}

function fromData(id: string, data: DocumentData): Booking {
  return {
    id,
    userId: data.userId ?? "",
    email: data.email ?? "",
    routeId: data.routeId ?? "",
    origin: data.origin ?? "",
    destination: data.destination ?? "",
    departureTime:
      data.departureTime instanceof Timestamp
        ? data.departureTime.toMillis()
        : data.departureTime ?? Date.now(),
    plateNumber: data.plateNumber ?? "N/A",
    isAircon: data.isAircon ?? false,
    seatNumber: data.seatNumber ?? 0,
    price: data.price ?? 0,
    status: data.status ?? "pending",
    checkoutId: data.checkoutId ?? "",
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt ?? Date.now(),
  };
}

/** Ported from lib/data/data_sources/UserTicketDatabase.dart */
export const BookingDatabase = {
  async uploadBooking(booking: Omit<Booking, "id" | "createdAt">): Promise<string> {
    const ref = await addDoc(bookingsCol, {
      ...booking,
      departureTime: Timestamp.fromMillis(booking.departureTime),
      createdAt: Timestamp.now(),
    });
    return ref.id;
  },

  /** Mirrors getUserTickets() — this user's own bookings, realtime. */
  subscribeForUser(
    userId: string,
    onChange: (bookings: Booking[]) => void,
    onError?: (e: unknown) => void
  ) {
    const q = query(bookingsCol, where("userId", "==", userId));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map(fromDoc)),
      (err) => onError?.(err)
    );
  },

  /** Mirrors the admin-side collectionGroup('tickets') query — every rider's bookings. */
  subscribeAll(onChange: (bookings: Booking[]) => void, onError?: (e: unknown) => void) {
    return onSnapshot(
      bookingsCol,
      (snap) => onChange(snap.docs.map(fromDoc)),
      (err) => onError?.(err)
    );
  },

  async getAllForRoute(routeId: string): Promise<Booking[]> {
    const q = query(bookingsCol, where("routeId", "==", routeId));
    const snap = await getDocs(q);
    return snap.docs.map(fromDoc);
  },

  async getUnpaidForUser(userId: string): Promise<Booking[]> {
    const q = query(bookingsCol, where("userId", "==", userId), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs.map(fromDoc);
  },

  async markPaid(bookingId: string): Promise<void> {
    await updateDoc(doc(db, "bookings", bookingId), { status: "paid" });
  },

  async deleteBooking(bookingId: string): Promise<void> {
    await deleteDoc(doc(db, "bookings", bookingId));
  },

  async getById(bookingId: string): Promise<Booking | null> {
    const snap = await getDoc(doc(db, "bookings", bookingId));
    if (!snap.exists()) return null;
    return fromData(snap.id, snap.data());
  },
};
