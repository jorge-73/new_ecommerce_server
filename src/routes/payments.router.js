import AppRouter from "./router.js";
import paymentsController from "../controllers/payments.controller.js";

class PaymentsRouter extends AppRouter {
  init() {
    this.get("/createCheckout", ["user", "premium"], paymentsController.createPayments);
    this.get("/success", ["user", "premium"], paymentsController.paymentSuccess);
    this.get("/cancel", ["user", "premium"], paymentsController.paymentCancel);
  }
}

const paymentsRouter = new PaymentsRouter();
export default paymentsRouter;
