import { Request } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

import { userService } from "../services/userService";
import { JwtPayload, User } from "../types";
import { logger } from "../helpers";
import { config } from "../config";
import { messages } from "../constants";

// Local strategy: it will receive the login POST
// we will use the 'email' and 'password' fields of the body
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // verifies if the user exists in the database
        const user = await userService.findUserByEmail(email);

        if (!user) {
          logger.error("Invalid email or password");
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        // if it is found, verifies if the password is correct
        // if it does not match, return false ("Not authorized")
        if (!bcrypt.compareSync(password, user.password)) {
          logger.error("Invalid email or password");
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        // otherwise, return the user info in order to generate the token
        return done(null, user);
      } catch (err) {
        logger.error(err);
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  const userDocument = user as User;
  return done(null, userDocument.id);
});

passport.deserializeUser<string>(async (id, done) => {
  try {
    const user = await userService.findUserById(id);
    return done(null, user);
  } catch (err) {
    logger.error(err);
    return done(err);
  }
});

const jwtVerification = async (jwtPayload: JwtPayload, done: VerifiedCallback) => {
  try {
    const user = await userService.findUserById(jwtPayload.id);

    if (!user) {
      logger.error(messages.USER_NOT_FOUND);
      return done(null, false, {
        message: messages.USER_NOT_FOUND,
      });
    }

    return done(null, user);
  } catch (err) {
    logger.error(err);
    return done(err, false);
  }
};

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.accessTokenPrivateKey,
    },
    jwtVerification,
  ),
);

const cookieExtractor = (req: Request) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return null;
  }

  return refreshToken;
};

passport.use(
  "jwt-refresh",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.refreshTokenPrivateKey,
    },
    jwtVerification,
  ),
);

export default passport.initialize();
