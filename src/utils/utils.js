import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { PRIVATE_KEY } from "./variables.js";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
export const srcDir = dirname(__filename);
export const __dirname = join(srcDir, "..");

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user?.password);

export const generateToken = (user, hs) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: hs });
  return token;
};

export const generateUniqueCode = () => {
  codeid = nanoid();
  return codeid;
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({ status: "error", error: err.message });
      }
      if (!user) {
        const message =
          info && info.message ? info.message : "Authentication failed";
        return res.status(401).json({ status: "error", error: message });
      }
      if (info && info.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", error: "Token expired" });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};
