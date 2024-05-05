import { STRIPE_API_KEY, CLIENT_URL } from "../utils/variables.js";
import { CartService, purchaseService } from "../services/cart.service.js";
import logger from "../utils/logger.js";
import Stripe from "stripe";
import { ticketModel } from "../models/ticket.model.js";

const stripe = new Stripe(STRIPE_API_KEY);

class PaymentsController {

  async createCheckout(req, res) {
    try {
      const cartId = req.params.cid;
      if (!cartId) return res.sendRequestError("No cart provided");
      const cart = await CartService.getCart(cartId);
      const lineItems = cart.products.map((prod) => {
        const price = Math.round(prod.product.price * 100);
        return {
          price_data: {
            product_data: {
              name: prod.product.title,
              description: prod.product.description,
            },
            currency: "usd",
            unit_amount: price,
          },
          quantity: prod.quantity,
        };
      });

      const sessions = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: `${CLIENT_URL}/payments/success/${cartId}`,
        cancel_url: `${CLIENT_URL}/payments/cancel`,
      });

      return res.sendSuccess(sessions);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async paymentSuccess(req, res) {
    try {
      const cartId = req?.user?.user?.cart;
      if (!cartId) return res.sendRequestError("No cart provided");
      const cart = await CartService.getCart(cartId);
      res.sendSuccess({ cartId: cart._id });
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async paymentCancel(req, res) {
    try {
      res.sendSuccess("Payments Cancel");
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async getTicket(req, res) {
    try {
      const ticketId = req.params.tid;
      if (!ticketId) return res.sendRequestError("Ticket not found");
      const ticket = await CartService.getPurchase(ticketId);
      res.sendSuccess(ticket);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
}

const paymentsController = new PaymentsController();
export default paymentsController;
