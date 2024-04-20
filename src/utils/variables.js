import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 8080;
export const ENVIRONMENT = process.env.ENVIRONMENT;
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const SIGNED_COOKIE_KEY = process.env.SIGNED_COOKIE_KEY;
export const SECRET_PASS = process.env.SECRET_PASS;
export const PERSISTENCE = process.env.PERSISTENCE;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const NODEMAILER_USER = process.env.NODEMAILER_USER;
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS;
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
export const CLIENT_URL = process.env.CLIENT_URL;