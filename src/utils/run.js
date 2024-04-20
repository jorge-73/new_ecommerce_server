import AppRouter from "../routes/router.js";
import authRouter from "../routes/auth.router.js";
import productsRouter from "../routes/products.router.js";
import cartsRouter from "../routes/carts.router.js";
import usersRouter from "../routes/users.router.js";
import paymentsRouter from "../routes/payments.router.js";

const run = (app) => {

  app.use("/api/auth", authRouter.getRouter());
  app.use("/api/products", productsRouter.getRouter());
  app.use("/api/carts", cartsRouter.getRouter());
  app.use("/api/users", usersRouter.getRouter());
  app.use("/api/payments", paymentsRouter.getRouter());

  class IndexRouter extends AppRouter {
    init() {
      this.get("/", ["public"], (req, res) => {
        res.json({ message: "Welcome to the api" });
      });
    }
  }
  const indexRouter = new IndexRouter();
  app.use("/", indexRouter.getRouter());
};

export default run;
