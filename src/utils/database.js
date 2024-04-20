import mongoose from "mongoose";
import { MONGO_URI, MONGO_DB_NAME, PORT } from "./variables.js";
import logger from "./logger.js";
import run from "./run.js";

export const connectdb = async (app) => {
  try {
    mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
    logger.info(">>> Data Base is connected");

    app.listen(PORT, () =>
      logger.http(`Server listening on port http://localhost:${PORT}`)
    );

    run(app);

  } catch (error) {
    logger.error(`Cannot connect to data base: ${error.message}`);
    process.exit();
  }
};
