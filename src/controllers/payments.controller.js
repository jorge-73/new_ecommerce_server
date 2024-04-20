import { STRIPE_API_KEY, PORT } from "../utils/variables.js";
import { CartService } from "../services/cart.service.js";
import logger from "../utils/logger.js";
import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY);

class PaymentsController {
  async createPayments(req, res) {
    try {
      const cartId = req.user.user.cart;
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
        success_url: `http://localhost:${PORT}/api/payments/success`,
        cancel_url: `http://localhost:${PORT}/api/payments/cancel`,
      });

      return res.redirect(sessions.url);
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
}

const paymentsController = new PaymentsController();
export default paymentsController;
