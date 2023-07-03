import { env } from "../helpers";

export const config = {
  API_VERSION: "v1",
  salt: env("SALT", 10) as number,

  // jwt parameters
  refreshTokenPrivateKey: env("REFRESH_TOKEN_PRIVATE_KEY", "secret") as string,
  accessTokenPrivateKey: env("ACCESS_TOKEN_PRIVATE_KEY", "secret") as string,
  refreshTokenExpiration: env("REFRESH_TOKEN_EXPIRATION", "1m") as string,
  accessTokenExpiration: env("ACCESS_TOKEN_EXPIRATION", "1m") as string,

  // token parameters
  refreshTokenName: "refreshToken",
  cookieDomain: env("COOKIE_DOMAIN", "localhost") as string,
};
