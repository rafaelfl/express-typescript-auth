import jwt from "jsonwebtoken";

import { JwtPayload, User, UserRoles, UserToken } from "../types";
import { config } from "../config";
import { messages } from "../constants";

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

export const verifyRefreshToken = async (userToken: UserToken | undefined) => {
  const privateKey = config.refreshTokenPrivateKey;
  const resfreshToken = userToken?.token;

  return new Promise<JwtPayload>((resolve, reject) => {
    if (!resfreshToken) {
      reject(new Error(messages.INVALID_TOKEN));
      return;
    }

    jwt.verify(resfreshToken, privateKey, (err, decodedToken) => {
      console.log("  verify refresh token");
      if (err) {
        console.log("  ERR refresh token");
        reject(new Error(messages.INVALID_TOKEN));
        return;
      }

      resolve(decodedToken as JwtPayload);
    });
  });
};
