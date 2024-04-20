import { sendAccountDeleteEmail } from "../libs/nodemailer/mailer.js";
import { UserService } from "../services/user.service.js";
import UserDTO from "../dto/user.dto.js";
import logger from "../utils/logger.js";

class UsersController {
  async updatedUserRole(req, res) {
    try {
      const uid = req.params.uid;
      const user = await UserService.findById(uid);

      // Verificar si el usuario tiene la propiedad "documents" y crearla si no existe
      if (!user.documents) {
        user.documents = [];
        user.status = false;
        await UserService.update(uid, user);
      }
      if (!user) return res.sendRequestError("user not found");
      if (user.role === "admin")
        return res.sendUserError("Admin cannot change user roles");

      if (user.role === "premium") {
        // Si el usuario actual es "premium", no aplicar restricciones, permitir cambiar a "user"
        user.role = "user";
      } else {
        if (user.status !== true) {
          logger.error("User has not completed document processing");
          return res.sendRequestError(
            "User has not completed document processing"
          );
        }
        user.role = "premium";
      }
      const updatedUser = await UserService.update(uid, user);
      res.sendSuccess(updatedUser);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async addFiles(req, res) {
    try {
      if (!req.files) {
        return res.sendRequestError("Image not found");
      }
      
      const uid = req.params.uid;
      const user = await UserService.findById(uid);
      if (!user) return res.sendRequestError("User not found");
      
      // Verificar si el usuario tiene la propiedad "documents" y crearla si no existe
      if (!user.documents) {
        user.documents = [];
        user.status = false;
      }
      // Verificar el tipo de archivo (profile, product, document)
      const { fileType } = req.body;
      if (fileType === "profile") {
        user.profile_Picture = req.files[0]?.originalname;
      }
      if (fileType === "document") {
        user.documents.push({
          name: req.files[0].originalname,
          reference: req.files[0].originalname,
        });
        // Actualizamos el estado a true cuando se carga un documento
        user.status = true;
      }
      const result = await UserService.update(uid, user);
      res.sendSuccess(result);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async deleteInactiveUsers(req, res) {
    try {
      const currentDate = new Date();
      const twoDaysAgo = new Date(currentDate);
      twoDaysAgo.setDate(currentDate.getDate() - 2);
      const findInactiveUsers = await UserService.findInactiveUsers(twoDaysAgo);
      const users = findInactiveUsers.map((user) => new UserDTO(user));
      const inactiveUsers = users.filter((user) => user.role !== "admin");
      // Eliminar usuarios inactivos
      if (inactiveUsers.length > 0) {
        for (const user of inactiveUsers) {
          if (user.role !== "admin") {
            await UserService.delete(user.id);
            // Envio del correo de notificación
            await sendAccountDeleteEmail(user);
          }
        }
        res.sendSuccess("Inactive users have been cleaned up");
      } else {
        res.sendNoContent("No inactive users to clean up");
      }
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async deleteUser(req, res) {
    try {
      const uid = req.params.uid;
      const findUser = await UserService.findById(uid);
      if (findUser) {
        const user = new UserDTO(findUser);
        await sendAccountDeleteEmail(user);
      }
      await UserService.delete(uid);
      res.sendSuccess("User is delete");
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
}

const usersController = new UsersController();
export default usersController;
