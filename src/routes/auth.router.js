import authController from "../controllers/auth.controller.js";
import { passportCall } from "../utils/utils.js";
import AppRouter from "./router.js";

class AuthRouter extends AppRouter {
  init() {
    this.post("/register", ["public"], passportCall("register"), authController.register);
    this.post("/login", ["public"], passportCall("login"), authController.login);
    this.post("/logout", ["public"], passportCall("jwt"), authController.logout);
    this.post("/passwordChange", ["public"], authController.passwordChange);
    this.get("/passwordChange/:tid", ["public"], authController.getTokenPassword);
    this.post("/newPassword/:tid", ["public"], authController.sendNewPassword);
  }
}

const authRouter = new AuthRouter();
export default authRouter;