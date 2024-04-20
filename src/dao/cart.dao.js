import { cartModel } from "../models/cart.model.js";
import { ticketModel } from "../models/ticket.model.js";

export default class CartDAO {
  addCart = async (cart) => await cartModel.create(cart);
  getCart = async (id) => await cartModel.findById(id);
  updateCart = async (filter, update) =>
    await cartModel.findOneAndUpdate(filter, update, { returnOriginal: false });
  deleteCart = async (id) =>
    await cartModel.findByIdAndUpdate(id, { products: [] }, { new: true });
  create = async (cart) => await cartModel.create(cart);
  createPurchase = async (ticket) => await ticketModel.create(ticket);
  getPurchase = async (id) => await ticketModel.findById(id);
}
