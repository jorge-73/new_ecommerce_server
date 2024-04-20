import { productModel } from "../models/product.model.js";

export default class ProductDAO {
  find = async () => await productModel.find();
  findCode = async (code) => await productModel.findOne({ code });
  findPaginate = async (filter, options) =>
    await productModel.paginate(filter, options);
  findById = async (id) => await productModel.findById(id);
  create = async (data) => await productModel.create(data);
  update = async (id, data) =>
    await productModel.findByIdAndUpdate(id, data, { new: true });
  delete = async (id) => await productModel.findByIdAndDelete(id);
}
