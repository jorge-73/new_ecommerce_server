import { sendEmailRegister } from "../libs/nodemailer/mailer.js";
import { UserService } from "../services/user.service.js";
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../utils/variables.js";
import { createHash, generateToken, isValidPassword } from "../utils/utils.js";
import { emailResetPassword } from "../libs/nodemailer/mailer.js";
import { UserPasswordService } from "../services/userPass.service.js";
import UserEmailDTO from "../dto/userEmail.dto.js";
import UserDTO from "../dto/user.dto.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

class AuthController {
  async register(req, res) {
    try {
      if (!req.user) return res.sendUserError("No user provided");
      const user = req.user;
      const userDTO = new UserDTO(user);
      // Filtro solo los datos necesarios para enviar por mail
      const userEmail = new UserEmailDTO(user);
      // Creo el email de bienvenida con los datos devueltos por dto
      if (!userEmail.email) {
        logger.error("No email address provided for the user.");
        return res.sendUserError("Email address is required for registration.");
      }
      sendEmailRegister(userEmail);
      const access_token = generateToken(userDTO, "12h");
      res
        .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
        .sendSuccess(userDTO);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async login(req, res) {
    try {
      // El usuario ha sido autenticado exitosamente
      const user = req.user;
      const userDTO = new UserDTO(user);
      const access_token = generateToken(user, "12h");
      res
        .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
        .sendSuccess(userDTO);
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie(SIGNED_COOKIE_KEY).sendSuccess("Logout");
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async passwordChange(req, res) {
    try {
      const { email } = req.body;
      const userFound = await UserService.findOne({ email });
      if (!userFound) return res.sendRequestError("Invalid Email");
      const userEmail = new UserEmailDTO(userFound);
      const token = generateToken(userEmail, "1h");
      await UserPasswordService.create({ email, token });
      await emailResetPassword(userEmail, token);
      res.sendSuccess(
        `Email successfully send to ${email} in order to reset password`
      );
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async sendNewPassword(req, res) {
    try {
      const tid = req.params.tid;
      if (!tid)
        return res.sendRequestError("invalid token | token has expired");
      const userEmail = jwt.verify(tid, PRIVATE_KEY);
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword)
        return res.sendUserError("Passwords do not match");
      const userFound = await UserService.findOne({
        email: userEmail?.user?.email,
      });
      if (!userFound || isValidPassword(userFound, password))
        return res.sendRequestError("Error updating password");
      const userUpdated = await UserService.update(userEmail?.user?._id, {
        password: createHash(password),
      });
      if (!userUpdated) return res.sendRequestError("Error updating password");
      res.sendSuccess("Password successfully updated");
    } catch (error) {
      logger.error(error);
      res.sendServerError(error.message);
    }
  }
  async getTokenPassword(req, res) {
    const tid = req.params.tid;
    const tokenId = await UserPasswordService.findOne({ token: tid });
    if (!tokenId)
      return res.sendRequestError("invalid token | token has expired");
    res.sendSuccess(tid);
  }
}

const authController = new AuthController();
export default authController;
