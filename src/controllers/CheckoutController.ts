import { paymentGateway } from "../services/PaymentGateway";
import { Checkout } from "../types";

/** Ported from lib/data/controllers/CheckoutController.dart */
class CheckoutController {
  async createCheckout(input: {
    amount: number;
    itemDescription: string;
    description: string;
  }): Promise<Checkout> {
    try {
      return await paymentGateway.createCheckout(input);
    } catch (e) {
      throw new Error(`Controller error createCheckout: ${e}`);
    }
  }

  async getCheckout(id: string): Promise<Checkout> {
    try {
      return await paymentGateway.getCheckout(id);
    } catch (e) {
      throw new Error(`Controller error getCheckout: ${e}`);
    }
  }

  async markPaid(id: string): Promise<void> {
    try {
      await paymentGateway.markPaid(id);
    } catch (e) {
      throw new Error(`Controller error markPaid: ${e}`);
    }
  }

  async expireCheckout(id: string): Promise<void> {
    try {
      await paymentGateway.expireCheckout(id);
    } catch (e) {
      throw new Error(`Controller error expireCheckout: ${e}`);
    }
  }
}

export const checkoutController = new CheckoutController();
