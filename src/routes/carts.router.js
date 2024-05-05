import cartsController from "../controllers/carts.controller.js";
import AppRouter from "./router.js";

class CartsRouter extends AppRouter {
  init() {
    this.post("/", ["user", "admin", "premium"], cartsController.addCart);
    this.post("/:cid/product/:pid", ["user", "premium"], cartsController.addProductToCart);
    this.get("/:cid", ["user", "admin", "premium"], cartsController.getCart);
    this.put("/:cid/product/:pid", ["user", "admin", "premium"], cartsController.updateProductToCart);
    this.put("/:cid", ["user", "admin", "premium"], cartsController.updatedCart);
    this.delete("/:cid", ["user", "admin", "premium"], cartsController.deleteCart);
    this.delete("/:cid/product/:pid", ["user", "premium"], cartsController.deleteProductInCart);
    this.get("/:cid/purchase", ["user", "premium"], cartsController.getPurchase);
  }
}

const cartsRouter = new CartsRouter();
export default cartsRouter;