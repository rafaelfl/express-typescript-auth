import { env } from "../helpers";

export const config = {
  API_VERSION: "v1",
  salt: 10,

  // jwt parameters
  refreshTokenPrivateKey: "secret",
  accessTokenPrivateKey: "secret",
  refreshTokenExpiration: "1m",
  accessTokenExpiration: "1m",

  // token parameters
  refreshTokenName: "refreshToken",
  cookieDomain: "localhost",

  // database
  databaseUrl: "mongodb://authusers:123456@mongo:27017/authusers",
  databaseUser: "authusers",
  databasePassword: "123456",
};

export const loadConfigVariables = () => {
  config.salt = env("SALT", config.salt) as number;

  // jwt parameters
  config.refreshTokenPrivateKey = env(
    "REFRESH_TOKEN_PRIVATE_KEY",
    config.refreshTokenPrivateKey,
  ) as string;
  config.accessTokenPrivateKey = env(
    "ACCESS_TOKEN_PRIVATE_KEY",
    config.accessTokenPrivateKey,
  ) as string;
  config.refreshTokenExpiration = env(
    "REFRESH_TOKEN_EXPIRATION",
    config.refreshTokenExpiration,
  ) as string;
  config.accessTokenExpiration = env(
    "ACCESS_TOKEN_EXPIRATION",
    config.accessTokenExpiration,
  ) as string;

  // token parameters
  config.cookieDomain = env("COOKIE_DOMAIN", config.cookieDomain) as string;

  // database
  config.databaseUrl = env("DATABASE_URL", config.databaseUrl) as string;
  config.databaseUser = env("DATABASE_USER", config.databaseUser) as string;
  config.databasePassword = env("DATABASE_PASSWORD", config.databasePassword) as string;
};
