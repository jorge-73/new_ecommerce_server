import { PERSISTENCE } from "../../utils/variables.js";

export let Product;
export let Cart;
export let User;
export let UserPass;

switch (PERSISTENCE) {
  case "MONGO":
    const { default: ProductDAO } = await import("../product.dao.js");
    const { default: CartDAO } = await import("../cart.dao.js");
    const { default: UserDAO } = await import("../user.dao.js");
    const { default: UserPassDAO } = await import("../userPass.dao.js");
    Product = ProductDAO;
    Cart = CartDAO;
    User = UserDAO;
    UserPass = UserPassDAO;
    break;
  default:
    break;
}
