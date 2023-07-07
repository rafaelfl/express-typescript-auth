import jwt from "jsonwebtoken";

import { UserRoles } from "../types";
import { config } from "../config";

export const generateTokens = (id: string, role: UserRoles) => {
  const payload = { id, role };

  const accessToken = jwt.sign(payload, config.accessTokenPrivateKey, {
    expiresIn: config.accessTokenExpiration,
  });

  const refreshToken = jwt.sign(payload, config.refreshTokenPrivateKey, {
    expiresIn: config.refreshTokenExpiration,
  });

  return { accessToken, refreshToken };
};
