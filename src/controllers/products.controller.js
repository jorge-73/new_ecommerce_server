import { sendingEmailDeletedProduct } from "../libs/nodemailer/mailer.js";
import { ProductService } from "../services/product.service.js";
import { UserService } from "../services/user.service.js";
import logger from "../utils/logger.js";

class ProductsCotroller {
  async getProducts(req, res) {
    try {
      const result = await ProductService.find();
      return res.sendSuccess(result);
    } catch (error) {
      logger.error(error.message);
      return res.sendServerError(error.message);
    }
  }
  async getProductById(req, res) {
    try {
      const pid = req.params.pid;
      const result = await ProductService.findById(pid);
      if (!result) return res.sendRequestError("Product not found");
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async createProduct(req, res) {
    try {
      if (!req.files) {
        logger.info("No image");
      }
      const { title, description, price, code, category, stock } = req.body;
      if (!title || !description || !price || !code || !category || !stock) {
        return res.sendUserError(
          "Product no can be created without properties"
        );
      }

      const productCode = await ProductService.findCode(code);
      if (productCode)
        return res.sendUserError("Cannot repeat the product code");

      let product = {
        title,
        description,
        price: parseFloat(price),
        thumbnails: req.files ? [req?.files[0]?.originalname] : [],
        code,
        category,
        stock: parseInt(stock),
      };

      // Establece el propietario del producto como "admin" si no se proporciona un usuario
      product.owner =
        req.user.user && req.user.user.role === "premium"
          ? req.user.user._id
          : "admin";

      const result = await ProductService.create(product);
      // const products = await ProductService.find();
      // req.app.get("socketio").emit("updatedProducts", products);
      res.createdSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async updateProduct(req, res) {
    try {
      const pid = req.params.pid;
      const updated = req.body;
      const productFind = await ProductService.findById(pid);
      if (!productFind) return sendRequestError("Product not found");

      // Verificar si el usuario no es un administrador y el producto no le pertenece
      if (
        req.user.user.role !== "admin" &&
        productFind?.owner !== req.user.user._id
      ) {
        return res.sendUserError(
          "You are not authorized to update this product"
        );
      }

      if (updated._id === pid) return res.sendUserError("Cannot modify product id");

      await ProductService.update(pid, updated);

      const products = await ProductService.find();
      // req.app.get("socketio").emit("updatedProducts", products);

      res.sendSuccess(products);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async deleteProduct(req, res) {
    try {
      const pid = req.params.pid;
      const product = await ProductService.findById(pid);
      // Verificar si el producto no existe
      if (!product)
        return res.sendRequestError(`No such product with id: ${pid}`);

      // Verificar si el usuario no es un administrador y el producto no le pertenece
      if (
        req.user.user.role !== "admin" &&
        product?.owner !== req.user.user._id
      ) {
        return res.sendUserError(
          "You are not authorized to delete this product"
        );
      }
      // Si el producto eliminado es propiedad de un usuario premium enviamos el email informando de su eliminación
      if (product.owner !== "admin") {
        const owner = await UserService.findById(product.owner);
        owner && (await sendingEmailDeletedProduct(owner, product));
      }
      // Si llegamos hasta aquí, el usuario es un administrador o el producto le pertenece
      const result = await ProductService.delete(pid);
      if (!result)
        return res.sendRequestError(`No such product with id: ${pid}`);

      const products = await ProductService.find();
      // req.app.get("socketio").emit("updatedProducts", products);

      res.sendSuccess(products);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
}

const productsController = new ProductsCotroller();
export default productsController;
