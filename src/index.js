import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookeParser from "cookie-parser";
import { connectdb } from "./utils/database.js";
import { __dirname } from "./utils/utils.js";
import { SECRET_PASS, CLIENT_URL } from "./utils/variables.js";
import initializePassport from "./config/config.passport.js";
import passport from "passport";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configurar el middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(`${__dirname}/public`));
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(cookeParser(SECRET_PASS));
initializePassport();
app.use(passport.initialize());

connectdb(app);
