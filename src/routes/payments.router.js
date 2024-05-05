import AppRouter from "./router.js";
import paymentsController from "../controllers/payments.controller.js";

class PaymentsRouter extends AppRouter {
  init() {
    this.post("/createCheckout/:cid", ["user", "premium"], paymentsController.createCheckout);
    this.get("/success", ["user", "premium"], paymentsController.paymentSuccess);
    this.get("/cancel", ["user", "premium"], paymentsController.paymentCancel);
    this.get("/getTicket/:tid", ["user", "premium"], paymentsController.getTicket);
  }
}

const paymentsRouter = new PaymentsRouter();
export default paymentsRouter;
