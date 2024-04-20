import { CartService, purchaseService } from "../services/cart.service.js";
import { ProductService } from "../services/product.service.js";
import logger from "../utils/logger.js";

class CartsController {
  async addCart(req, res) {
    try {
      const result = await CartService.addCart(req);
      res.createdSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async addProductToCart(req, res) {
    try {
      const pid = req.params.pid;
      const product = await ProductService.findById(pid);
      if (!product) return res.sendRequestError("Invalid product");
      const cid = req.params.cid;
      const cart = await CartService.getCart(cid);
      if (!cart) return res.sendRequestError("Invalid cart");

      // Verificar si el usuario es premium
      const currentUser = req.user.user;
      if (currentUser.role === "premium" && product.owner === currentUser._id) {
        return res.sendUserError(
          "Premium users cannot add their own products to the cart"
        );
      }

      // Verificar si el producto ya existe en el carrito
      const existingProduct = cart.products.findIndex(
        (item) => item.product._id == pid
      );
      if (existingProduct !== -1) {
        // Si existe incrementar la cantidad del producto existente
        cart.products[existingProduct].quantity += 1;
      } else {
        // Si no existe agregar el producto al carrito
        const newProduct = {
          product: pid,
          quantity: 1,
        };
        cart.products.push(newProduct);
      }
      const result = await CartService.updateCart({ _id: cid }, cart);
      return res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async getCart(req, res) {
    try {
      const cartId = req.params.cid;
      const result = await CartService.getCart(cartId);
      if (!result)
        return res.sendRequestError(
          `The cart with id ${cartId} does not exist`
        );
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async updateProductToCart(req, res) {
    try {
      const cid = req.params.cid;
      const cart = await CartService.getCart(cid);
      if (!cart) return res.sendRequestError("Invalid cart");
      const pid = req.params.pid;
      // Verificar si el producto ya existe en el carrito
      const existingProduct = cart.products.findIndex(
        (item) => item.product._id == pid
      );
      if (existingProduct === -1)
        return res.sendRequestError("Invalid product");
      const quantity = req.body.quantity;
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.sendUserError("Quantity must be a positive integer");
      }
      // Actualizamos la cantidad del producto existente
      cart.products[existingProduct].quantity = quantity;
      const result = await CartService.updateCart({ _id: cid }, cart);
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async updatedCart(req, res) {
    try {
      const cid = req.params.cid;
      const cart = await CartService.getCart(cid);
      if (!cart) return res.sendRequestError("Invalid cart");
      const products = req.body.products;
      if (!Array.isArray(products))
        return res.sendUserError("The product array format is invalid");
      cart.products = products;

      const result = await CartService.updateCart({ _id: cid }, cart);
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async deleteCart(req, res) {
    try {
      const cid = req.params.cid;
      const result = await CartService.deleteCart(cid);
      if (!result) return res.sendRequestError("Invalid cart");
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async deleteProductInCart(req, res) {
    try {
      const cid = req.params.cid;
      const cart = await CartService.getCart(cid);
      if (!cart) return res.sendRequestError("Invalid cart");
      const pid = req.params.pid;
      // Verificar si el producto ya existe en el carrito
      const existingProduct = cart.products.findIndex(
        (item) => item.product._id == pid
      );
      if (existingProduct === -1)
        return res.sendRequestError("Invalid product");
      // Eliminamos el producto del carrito
      cart.products.splice(existingProduct, 1);
      await CartService.updateCart({ _id: cid }, cart);
      const result = await CartService.getCart(cid);
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async getPurchase(req, res) {
    try {
      const result = await purchaseService(req, res);
      return result;
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
}

const cartsController = new CartsController();
export default cartsController;
