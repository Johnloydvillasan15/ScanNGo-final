import { BookingDatabase } from "../data/BookingDatabase";
import { checkoutController } from "./CheckoutController";
import { Booking, Route } from "../types";

/** Ported from lib/data/controllers/UserTicket_data_controller.dart */
class UserTicketController {
  /** Creates the mock checkout session then writes the booking, seat held as "pending". */
  async bookAndCheckout(params: {
    route: Route;
    userId: string;
    email: string;
    seat: number;
  }): Promise<{ bookingId: string; checkoutUrl: string; checkoutId: string }> {
    const { route, userId, email, seat } = params;
    // PayMongo requires a minimum of ₱20 — mirrors the same floor in Testing.dart.
    const amount = Math.max(route.price, 20);

    const checkout = await checkoutController.createCheckout({
      amount: amount * 100,
      itemDescription: `Bus ticket from ${route.origin} to ${route.destination}`,
      description: `Payment for bus ticket - Seat #${seat}`,
    });

    const bookingId = await BookingDatabase.uploadBooking({
      userId,
      email,
      routeId: route.id,
      origin: route.origin,
      destination: route.destination,
      departureTime: route.departureTime,
      plateNumber: route.plateNumber,
      isAircon: route.isAircon,
      seatNumber: seat,
      price: route.price,
      status: "pending",
      checkoutId: checkout.id,
    });

    return { bookingId, checkoutUrl: checkout.checkoutUrl, checkoutId: checkout.id };
  }

  subscribeMyBookings(
    userId: string,
    onChange: (bookings: Booking[]) => void,
    onError?: (e: unknown) => void
  ) {
    return BookingDatabase.subscribeForUser(userId, onChange, onError);
  }

  async deleteBooking(bookingId: string): Promise<void> {
    try {
      await BookingDatabase.deleteBooking(bookingId);
    } catch (e) {
      console.warn("Error deleting booking:", e);
    }
  }

  /**
   * Ported from UserTicket_data_controller.dart's autoUpdateController(), which
   * polled PayMongo for each unpaid ticket. Here it polls the mock gateway, and
   * main.dart's Timer.periodic(30s) is reproduced by whichever screen calls this
   * on an interval (see HomeScreen/TicketsScreen).
   */
  async autoUpdatePendingPayments(userId: string): Promise<void> {
    const unpaid = await BookingDatabase.getUnpaidForUser(userId);
    for (const booking of unpaid) {
      try {
        const checkout = await checkoutController.getCheckout(booking.checkoutId);
        if (checkout.status === "paid") {
          await BookingDatabase.markPaid(booking.id);
        }
      } catch (e) {
        console.warn(`Error updating booking ${booking.id}:`, e);
      }
    }
  }
}

export const userTicketController = new UserTicketController();
