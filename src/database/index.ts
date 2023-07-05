import mongoose from "mongoose";

import { logger } from "../helpers";
import { config } from "../config";

/*
    Creating the mongoose user for connection
    use authusers

    db.createUser(
     {
       user: "authusers",
       pwd:  passwordPrompt(),   // or cleartext password
       roles: [ { role: "readWrite", db: "authusers" }]
     }
   )

    replace by mongoose seed or mongoose migration
*/

export const connect = async () => {
  const { databaseUrl, databaseUser, databasePassword } = config;

  mongoose.connection
    .on("error", err => logger.error(err.message))
    .on("disconnected", connect)
    .once("open", () => logger.info(`MongoDB connected to ${databaseUrl}`));

  await mongoose.connect(databaseUrl, {
    keepAlive: true,
    user: databaseUser,
    pass: databasePassword,
  });
};
