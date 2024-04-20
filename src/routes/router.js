import { Router } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../utils/variables.js";
import { cookieExtractor } from "../config/config.passport.js";

export default class AppRouter {
  constructor() {
    this.router = Router();
    this.init();
  }
  getRouter() {
    return this.router;
  }
  init() {} // Esta inicializacion sera para sus clases heredadas

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params);
      } catch (error) {
        logger.error(error);
        params[1].status(500).json({ error });
      }
    });
  }

  generateCustomResponses = (req, res, next) => {
    // sendSuccess permitira que el desarrollador solo tenga que enviar el
    // payload, el formato se gestionara de manera interna
    res.sendSuccess = (payload) => res.json({ status: "success", payload });
    res.createdSuccess = (payload) =>
      res.status(201).json({ status: "success", payload });
    res.sendNoContent = (payload) =>
      res.status(204).json({ status: "success", payload });
    res.sendUserError = (error) =>
      res.status(400).json({ status: "error", error });
    res.authFailError = (error) =>
      res.status(401).json({ status: "error", error });
    res.sendRequestError = (error) =>
      res.status(404).json({ status: "error", error });
    res.sendServerError = (error) =>
      res.status(500).json({ status: "error", error });
    next();
  };

  handlePolicies = (policies) => (req, res, next) => {
    if (policies[0] === "public") return next();
    const authHeaders = req.signedCookies[SIGNED_COOKIE_KEY];
    if (!authHeaders) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
    const token = cookieExtractor(req);
    // Obtenemos el usuario a partir del token;
    let user = jwt.verify(token, PRIVATE_KEY);
    
    if (!policies.includes(user?.user?.role)) {
      return res.status(403).json({ status: "error", error: "No authorized" });
    }
    req.user = user;
    next();
  };
}
