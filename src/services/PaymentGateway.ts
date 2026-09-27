import { Checkout } from "../types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Ported from lib/data/api/ApiService.dart.
 *
 * The original called the real PayMongo checkout-sessions API using a
 * hardcoded secret key. That's a live payment credential, not something to
 * copy into a school project, so this is a local mock gateway with the same
 * shape (createCheckout / getCheckout / markPaid / expireCheckout). Swap the
 * bodies of these methods for real `fetch()` calls to a payment provider
 * whenever you're ready to go live.
 *
 * Checkout sessions only ever change from "pending" to "paid" through this
 * app's own markPaid() call (there's no external processor to webhook back),
 * so an in-memory map for the lifetime of the app session is enough — it
 * doesn't need Firestore or AsyncStorage.
 */
class MockPaymentGateway {
  private sessions = new Map<string, Checkout>();

  async createCheckout(input: {
    amount: number;
    itemDescription: string;
    description: string;
  }): Promise<Checkout> {
    const now = Date.now();
    const checkout: Checkout = {
      id: newId("chk"),
      amount: input.amount,
      description: input.description,
      itemDescription: input.itemDescription,
      status: "pending",
      checkoutUrl: `scanandgo://pay/${newId("session")}`,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(checkout.id, checkout);
    return checkout;
  }

  async getCheckout(id: string): Promise<Checkout> {
    const found = this.sessions.get(id);
    if (!found) throw new Error(`Checkout ${id} not found`);
    return found;
  }

  /** Simulates the customer completing payment (stands in for a PayMongo webhook). */
  async markPaid(id: string): Promise<void> {
    const found = this.sessions.get(id);
    if (!found) throw new Error(`Checkout ${id} not found`);
    this.sessions.set(id, { ...found, status: "paid", updatedAt: Date.now() });
  }

  async expireCheckout(id: string): Promise<void> {
    const found = this.sessions.get(id);
    if (!found) throw new Error(`Checkout ${id} not found`);
    this.sessions.set(id, { ...found, status: "expired", updatedAt: Date.now() });
  }
}

export const paymentGateway = new MockPaymentGateway();
