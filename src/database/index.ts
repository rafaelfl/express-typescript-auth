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

export const connectMongoDB = async () => {
  const { databaseUrl, databaseUser, databasePassword } = config;

  mongoose.connection

    .on(
      "error",
      /* istanbul ignore next */
      err => logger.error(err.message),
    )
    .on("disconnected", connectMongoDB)
    .once(
      "open",
      /* istanbul ignore next */
      () => logger.info(`MongoDB connected to ${databaseUrl}`),
    );

  await mongoose.connect(databaseUrl, {
    user: databaseUser,
    pass: databasePassword,
  });
};
