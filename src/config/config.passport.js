import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import {
  SIGNED_COOKIE_KEY,
  ADMIN_EMAIL,
  PRIVATE_KEY,
} from "../utils/variables.js";
import { UserService } from "../services/user.service.js";
import { CartService } from "../services/cart.service.js";
import { createHash, isValidPassword } from "../utils/utils.js";
import logger from "../utils/logger.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

let token = null;
export const cookieExtractor = (req) => {
  token =
    req && req.signedCookies ? req.signedCookies[SIGNED_COOKIE_KEY] : null;
  return token;
};

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        if (!email || !password || !first_name || !last_name || !age) {
          return done(null, false, { message: "All fields must be filled." });
        }
        if (age < 18) {
          return done(null, false, {
            message: "You must be at least 18 years old.",
          });
        }
        try {
          const user = await UserService.findOne({ email: username });
          if (user) {
            return done(null, false, {
              message: "This email is already taken.",
            });
          }
          const cartNewUser = await CartService.create({});
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: cartNewUser._id,
          };
          if (newUser.email === ADMIN_EMAIL) {
            newUser.role = "admin";
          }
          const result = await UserService.create(newUser);
          return done(null, result);
        } catch (error) {
          logger.error(error.message);
          return done(`"Error creating user: ${error.message}`);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await UserService.findOne({ email: username });
          if (!user || !isValidPassword(user, password)) {
            return done(null, false, {message: "Incorrect email or password"});
          }
          // Actualizar solo la propiedad last_connection
          user.last_connection = new Date();
          await UserService.update(user._id, {
            last_connection: user.last_connection,
          });
          return done(null, user);
        } catch (error) {
          logger.error(error);
          return done("Error getting user");
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserService.findById(id);
  done(null, user);
});

export default initializePassport;
