import { env } from "../helpers/utils";

export const config = {
  API_VERSION: "v1",
  jwtSecretKey: env("SECRET_KEY", "secret") as string,
};
