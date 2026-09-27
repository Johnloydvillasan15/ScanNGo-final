import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { Route } from "../types";

const routesCol = collection(db, "routes");

function fromDoc(d: QueryDocumentSnapshot<DocumentData>): Route {
  const data = d.data();
  return {
    id: d.id,
    origin: data.origin ?? "",
    destination: data.destination ?? "",
    departureTime:
      data.departureTime instanceof Timestamp
        ? data.departureTime.toMillis()
        : data.departureTime ?? Date.now(),
    price: data.price ?? 0,
    totalSeats: data.totalSeats ?? 0,
    isAircon: data.isAircon ?? false,
    isCompleted: data.isCompleted ?? false,
    isReadyForDeparture: data.isReadyForDeparture ?? false,
    plateNumber: data.plateNumber ?? "N/A",
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt ?? Date.now(),
  };
}

/** Ported from lib/data/data_sources/AdminTicketDatabase.dart */
export const RouteDatabase = {
  async uploadRoute(route: Omit<Route, "id" | "createdAt">): Promise<void> {
    try {
      await addDoc(routesCol, {
        origin: route.origin,
        destination: route.destination,
        departureTime: Timestamp.fromMillis(route.departureTime),
        totalSeats: route.totalSeats,
        price: route.price,
        isAircon: route.isAircon,
        isCompleted: route.isCompleted,
        isReadyForDeparture: route.isReadyForDeparture,
        plateNumber: route.plateNumber,
        createdAt: Timestamp.now(),
      });
    } catch (e) {
      console.warn("Error uploading route:", e);
      throw e;
    }
  },

  /** Realtime listener — mirrors Stream<QuerySnapshot> getAllAdminTicket(). */
  subscribeAll(onChange: (routes: Route[]) => void, onError?: (e: unknown) => void) {
    return onSnapshot(
      routesCol,
      (snap) => onChange(snap.docs.map(fromDoc)),
      (err) => onError?.(err)
    );
  },

  async getAll(): Promise<Route[]> {
    const snap = await getDocs(routesCol);
    return snap.docs.map(fromDoc);
  },

  async deleteRoute(routeId: string): Promise<void> {
    await deleteDoc(doc(db, "routes", routeId));
  },

  async updateRoute(route: Route): Promise<void> {
    try {
      await updateDoc(doc(db, "routes", route.id), {
        origin: route.origin,
        destination: route.destination,
        departureTime: Timestamp.fromMillis(route.departureTime),
        totalSeats: route.totalSeats,
        price: route.price,
        isAircon: route.isAircon,
        isCompleted: route.isCompleted,
        plateNumber: route.plateNumber,
      });
    } catch (e) {
      console.warn("Error updating route:", e);
      throw e;
    }
  },

  async updateCompletedStatus(routeId: string, isCompleted: boolean): Promise<void> {
    await updateDoc(doc(db, "routes", routeId), { isCompleted });
  },

  async updateReadyForDeparture(routeId: string, isReadyForDeparture: boolean): Promise<void> {
    await updateDoc(doc(db, "routes", routeId), { isReadyForDeparture });
  },
};
