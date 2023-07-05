import jwt from "jsonwebtoken";

import { User, UserRoles } from "../types";
import { config } from "../config";

export const generateTokens = (user: User) => {
  const payload = { id: user.id, role: user.role };

  const accessToken = jwt.sign(payload, config.accessTokenPrivateKey, {
    expiresIn: config.accessTokenExpiration,
  });

  const refreshToken = jwt.sign(payload, config.refreshTokenPrivateKey, {
    expiresIn: config.refreshTokenExpiration,
  });

  return { accessToken, refreshToken };
};

export const generateAccessToken = (id: string, role: UserRoles) => {
  const payload = { id, role };

  const accessToken = jwt.sign(payload, config.accessTokenPrivateKey, {
    expiresIn: config.accessTokenExpiration,
  });

  return accessToken;
};
