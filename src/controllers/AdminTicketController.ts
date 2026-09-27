import { RouteDatabase } from "../data/RouteDatabase";
import { BookingDatabase } from "../data/BookingDatabase";
import { Route, Booking } from "../types";

/** Ported from lib/data/controllers/AdminTicket_data_controller.dart */
class AdminTicketController {
  subscribeRoutes(onChange: (routes: Route[]) => void, onError?: (e: unknown) => void) {
    return RouteDatabase.subscribeAll(onChange, onError);
  }

  async getRoutes(): Promise<Route[]> {
    return RouteDatabase.getAll();
  }

  async uploadRoute(route: Omit<Route, "id" | "createdAt">): Promise<void> {
    try {
      await RouteDatabase.uploadRoute(route);
    } catch (e) {
      console.warn("Error Controller upload:", e);
      throw e;
    }
  }

  async deleteRoute(route: Route): Promise<void> {
    // Mirrors the "this will also delete all associated bookings" warning
    // shown in ManageBusRoutesScreen.dart.
    const bookings = await BookingDatabase.getAllForRoute(route.id);
    for (const b of bookings) {
      await BookingDatabase.deleteBooking(b.id);
    }
    await RouteDatabase.deleteRoute(route.id);
  }

  async updateRoute(route: Route): Promise<void> {
    try {
      await RouteDatabase.updateRoute(route);
    } catch (e) {
      console.warn("Error Controller update:", e);
      throw e;
    }
  }

  async updateCompletedStatus(routeId: string, isCompleted: boolean): Promise<void> {
    try {
      await RouteDatabase.updateCompletedStatus(routeId, isCompleted);
    } catch (e) {
      console.warn("Error updating route status:", e);
    }
  }

  async updateReadyForDeparture(routeId: string, isReadyForDeparture: boolean): Promise<void> {
    try {
      await RouteDatabase.updateReadyForDeparture(routeId, isReadyForDeparture);
    } catch (e) {
      console.warn("Error updating ready-for-departure status:", e);
    }
  }

  /** Marks any route whose departure time has passed as completed. */
  async updateAllRouteStatuses(): Promise<void> {
    try {
      const now = Date.now();
      const all = await RouteDatabase.getAll();
      for (const route of all) {
        if (route.departureTime < now && !route.isCompleted) {
          await this.updateCompletedStatus(route.id, true);
        }
      }
    } catch (e) {
      console.warn("Error updating all route statuses:", e);
    }
  }

  /** Admin-side view of every booking across every rider. */
  async getAllBookings(): Promise<Booking[]> {
    try {
      // one-shot fetch is enough for the dashboards that use this
      return await new Promise<Booking[]>((resolve, reject) => {
        const unsub = BookingDatabase.subscribeAll((bookings) => {
          unsub();
          resolve(bookings);
        }, reject);
      });
    } catch (e) {
      console.warn("Error fetching all bookings:", e);
      return [];
    }
  }
}

export const adminTicketController = new AdminTicketController();
