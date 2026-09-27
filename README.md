# Scan&Go — React Native (Expo) App

This app now mirrors the **Paw Patrol** bus-ticketing project's actual
feature set and screen flow (its real, active home screen is
`lib/pages/Testing.dart` — the Flutter project's own
`screens/home/home_screen.dart` was dead/commented-out code and was not
ported). Everything below is written in React Native + TypeScript and
still runs on **your own Firebase project** — Firebase was intentionally
kept, at your request, rather than replaced.

Tech stack: **React Native (Expo) + TypeScript + Firebase (Auth +
Firestore)**.

## Features ported from Paw Patrol
- Email/password auth with role-based routing (`user` vs `admin`)
- Live bus-route browsing with a seat picker (2+2 layout, taken seats
  greyed out)
- A payment step with **Confirm Booking** (books the seat, payment
  pending) and **Proceed to Payment** (books + immediately marks paid) —
  see "About payments" below for why this is simulated
- QR-code ticket generation and a **My Tickets** screen with
  Ongoing/Completed tabs, plus a separate ticket History screen
- Admin dashboard: Add Bus Route, Manage Routes (edit/delete, with a
  warning that deleting a route deletes its bookings too), View
  Bookings per route, Completed Trips, and a **working QR scanner**
  (the Flutter version's `ScanQRScreen.dart` was a placeholder; this one
  actually opens the camera and looks up the scanned ticket)

## What's intentionally different from the Flutter app
- **Payments are mocked**, not real PayMongo. The Flutter code called
  the real PayMongo API with a hardcoded secret key — that's a live
  payment credential and was never safe to ship in a mobile app or copy
  into a school project. `src/services/PaymentGateway.ts` is a local
  mock with the exact same shape (`createCheckout` /
  `getCheckout` / `markPaid`), so swapping in a real payment
  provider later just means rewriting the insides of that one file.
- **No Firestore `admin` collection / `user/{uid}/tickets` subcollection.**
  Your existing Firestore project already used flat `routes` and
  `bookings` collections (see your original `firestore.rules`), so the
  data layer was ported to match that schema instead of Paw Patrol's
  Dart-side naming — same booking/seat logic, your existing collections.
- **No "Admin Demo" bypass button.** Paw Patrol's login screen could
  jump into the admin dashboard without logging in. That doesn't work
  against real Firestore security rules (writes require the signed-in
  user's `role` to actually be `"admin"`), so this was dropped — see
  "Testing the admin dashboard" below for how to get admin access for
  real.

## Requirements (install once on your computer)
- [Node.js](https://nodejs.org) (LTS version)
- The Expo Go app on your phone (App Store / Play Store), **or** a
  development build (required for the QR scanner — see note below)
- (Optional, for a real `.apk`) a free [Expo account](https://expo.dev)

> **Camera/QR scanner note:** `expo-camera`'s scanner works in Expo Go
> for quick testing, but for a production build you'll want
> `eas build` (see bottom of this file) so the camera permission and
> plugin config in `app.json` are baked in properly.

## Run it
```bash
cd ScanAndGoRN
npm install
npx expo start
```
Scan the printed QR code with **Expo Go**. `npx expo start --web` also
works for everything except the camera scanner.

## Set up Firebase
Since you already have a Firebase project for this app:
1. Open `src/firebase.ts` and confirm your real project config is in
   `firebaseConfig` (paste it in again if this is a fresh copy of the
   project — see the placeholders marked `YOUR_...`).
2. **Build → Authentication → Sign-in method** → Email/Password should
   already be enabled.
3. **Redeploy `firestore.rules`.** This project's rules file has one
   change from what you had before: `bookings` now allows an admin to
   **read** every booking (not just their own), because the admin
   dashboard's booking counts, View Bookings screen, and QR scanner all
   need to look up bookings that don't belong to the signed-in admin.
   Copy the included `firestore.rules` into **Firestore → Rules** in
   the console and publish it.
4. To test the admin dashboard: sign up once as a normal user, then in
   **Firestore → users → (that uid)**, manually change `role` from
   `"user"` to `"admin"`, then reload the app. This is unchanged from
   before — role changes are deliberately console-only, not something
   the app itself can grant.

## Project structure
```
App.tsx                              entry point, wraps app in AuthProvider
src/
  firebase.ts                        Firebase config + initialized auth/db
  theme.ts                           colors ported from Paw Patrol's app_style.dart
  types.ts                           TypeScript types + navigation param lists
  context/AuthContext.tsx            Firebase auth state, login/signup/logout
  data/
    RouteDatabase.ts                 Firestore CRUD for routes/{id}
    BookingDatabase.ts               Firestore CRUD for bookings/{id}
  controllers/
    AdminTicketController.ts         route management logic
    UserTicketController.ts          booking + checkout logic
    CheckoutController.ts            thin wrapper around the mock payment gateway
  services/
    TicketService.ts                 taken-seats-per-route lookup
    PaymentGateway.ts                mocked payment sessions (see above)
  components/                        Button, TextField, InfoRow, RouteCard,
                                      SeatPickerModal, PaymentModal
  navigation/
    AppNavigator.tsx                 routes by auth state + role
    UserTabs.tsx                     bottom tabs: Home / Tickets / Profile
    AdminNavigator.tsx               admin dashboard stack
  screens/
    LoginScreen.tsx, SignupScreen.tsx
    HomeScreen.tsx                   route list + seat picker + payment modal
    TicketsScreen.tsx                Ongoing/Completed tabs, Pay Now
    HistoryScreen.tsx                past trips, delete
    TicketQRScreen.tsx               QR code + ticket details
    ProfileScreen.tsx
    admin/
      AdminHomeScreen.tsx            dashboard tiles
      AddBusRouteScreen.tsx
      ManageBusRoutesScreen.tsx      edit / delete / view bookings
      ViewBookingsScreen.tsx
      CompletedTripsScreen.tsx
      ScanQRScreen.tsx               working camera QR scanner
firestore.rules                      security rules to publish in console
```

## Data model
- `users/{uid}` — `{ name, email, role: 'user'|'admin', createdAt }`
- `routes/{id}` — `{ origin, destination, departureTime, price, totalSeats, isAircon, isCompleted, isReadyForDeparture, plateNumber, createdAt }`
- `bookings/{id}` — `{ userId, email, routeId, origin, destination, departureTime, plateNumber, isAircon, seatNumber, price, status: 'pending'|'paid', checkoutId, createdAt }`

Taken seats for a route are computed live by querying `bookings` where
`routeId == route.id` (same approach Paw Patrol used, just against a
flat collection instead of a subcollection).

## About payments
"Confirm Booking" books the seat with `status: "pending"`. "Proceed to
Payment" books the seat and calls the mock gateway's `markPaid`
immediately. Pending bookings can also be completed later from **My
Tickets** via the "Pay Now (simulate)" button. None of this touches a
real payment processor — wire up a real one (PayMongo, Stripe, etc.)
server-side (e.g. a Firebase Cloud Function) before using this for
real transactions.

## Building a real `.apk` / `.ipa`
```bash
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```

## Suggested next steps
- A real payment integration via a Cloud Function + webhook
- Push notifications for schedule changes or "ready for departure"
- Marking a booking "boarded" when the admin scans it (currently the
  scanner just looks the ticket up and displays it)
