import usersController from "../controllers/users.controller.js";
import { uploaders } from "../libs/multer/multer.js";
import AppRouter from "./router.js";

class UsersRouter extends AppRouter {
  init() {
    this.get("/", ["admin"], usersController.getAllUsers);
    this.post("/premium/:uid", ["admin"], usersController.updatedUserRole);
    this.post("/:uid/documents", ["user", "premium", "admin"], uploaders, usersController.addFiles);
    this.delete("/inactiveUsers", ["admin"], usersController.deleteInactiveUsers);
    this.delete("/:uid", ["admin"], usersController.deleteUser);
  }
}

const usersRouter = new UsersRouter();
export default usersRouter;