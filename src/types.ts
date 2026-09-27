// Field names line up with your existing firestore.rules (users / routes / bookings),
// extended with the extra fields Paw Patrol's AdminBusTicket / UserBusTicket carry.

export type Role = "user" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
}

/** Firestore collection: routes/{routeId}. Ported from AdminBusTicket.dart. */
export interface Route {
  id: string;
  origin: string;
  destination: string;
  departureTime: number; // stored as a Firestore Timestamp, read back as epoch ms
  price: number;
  totalSeats: number;
  isAircon: boolean;
  isCompleted: boolean;
  isReadyForDeparture: boolean;
  plateNumber: string;
  createdAt: number;
}

/** Local-only mocked payment session (see services/PaymentGateway.ts). */
export type CheckoutStatus = "pending" | "paid" | "expired";

export interface Checkout {
  id: string;
  amount: number;
  description: string;
  itemDescription: string;
  status: CheckoutStatus;
  checkoutUrl: string;
  createdAt: number;
  updatedAt: number;
}

export type BookingStatus = "pending" | "paid";

/** Firestore collection: bookings/{bookingId}. Ported from UsereBusTicket.dart. */
export interface Booking {
  id: string;
  userId: string;
  email: string;
  routeId: string;
  origin: string;
  destination: string;
  departureTime: number;
  plateNumber: string;
  isAircon: boolean;
  seatNumber: number;
  price: number;
  status: BookingStatus;
  checkoutId: string;
  createdAt: number;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  UserTabs: undefined;
  TicketQR: { booking: Booking };
  History: undefined;
  AdminHome: undefined;
  AddBusRoute: undefined;
  ManageBusRoutes: undefined;
  ViewBookings: { route: Route };
  CompletedTrips: undefined;
  ScanQR: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  Tickets: undefined;
  Profile: undefined;
};
