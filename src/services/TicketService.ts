import { BookingDatabase } from "../data/BookingDatabase";
import { Route } from "../types";

/** Ported from lib/data/services/TicketService.dart */
class TicketService {
  /** Returns the set of seat numbers already taken for a specific trip. */
  async getTakenSeats(route: Route): Promise<Set<number>> {
    const bookings = await BookingDatabase.getAllForRoute(route.id);
    return new Set(bookings.map((b) => b.seatNumber));
  }
}

export const ticketService = new TicketService();
