export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }
  find = async () => await this.dao.find();
  findCode = async (code) => await this.dao.findCode(code);
  findPaginate = async (filter, options) =>
    await this.dao.findPaginate(filter, options);
  findById = async (id) => await this.dao.findById(id);
  create = async (data) => await this.dao.create(data);
  update = async (id, data) => await this.dao.update(id, data);
  delete = async (id) => await this.dao.delete(id);
}
