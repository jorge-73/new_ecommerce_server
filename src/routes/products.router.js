import { uploaders } from "../libs/multer/multer.js";
import productsController from "../controllers/products.controller.js";
import AppRouter from "./router.js";

class ProductsRouter extends AppRouter {
  init() {
    this.get("/", ["user", "admin", "premium"], productsController.getProducts);
    this.get("/:pid", ["user", "admin", "premium"], productsController.getProductById);
    this.post("/", ["admin", "premium"], uploaders, productsController.createProduct);
    this.put("/:pid", ["admin", "premium"], productsController.updateProduct);
    this.delete("/:pid", ["admin", "premium"], productsController.deleteProduct);
  }
}

const productsRouter = new ProductsRouter();
export default productsRouter;