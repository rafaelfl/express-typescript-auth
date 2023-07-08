import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { logger } from "../helpers";
import { USER_ROLES } from "../types";

const formattedValidationResult = validationResult.withDefaults({
  formatter: ({ msg }) => ({
    msg,
  }),
});

// validation for user resources
const userResourceValidator = [
  body("name", "'name' is required and must exceed 5 characters").isLength({
    min: 5,
  }),
  body("email", "Invalid email address").isEmail(),
  body("password", "'password' is required and must exceed 5 characters").isLength({ min: 5 }),
];

export const validators = {
  loginValidationRules: [
    body("email", "Invalid email address").isEmail(),
    body("password", "'password' is required and must exceed 5 characters").isLength({ min: 5 }),
  ],
  registerValidationRules: [
    ...userResourceValidator,
    body("passwordConfirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        // throw error if passwords do not match
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],

  createAccountValidationRules: [
    ...userResourceValidator,
    body("role", "'role' is required and must have a valid value").isString().isIn(USER_ROLES),
  ],

  updateProfileValidationRules: [
    body("name", "'name' must exceed 5 characters").optional().isLength({
      min: 5,
    }),
    body("password", "'password' must exceed 5 characters").optional().isLength({ min: 5 }),
    body("passwordConfirmation").custom((value, { req }) => {
      if (req.body.password && value !== req.body.password) {
        // throw error if passwords do not match
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    body("photo", "'photo' must be a valid URL").optional().isURL(),
    body("aboutMe").optional().isString(),
  ],

  validate: (req: Request, res: Response, next: NextFunction) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = formattedValidationResult(req);

    if (!errors.isEmpty()) {
      logger.error(errors.array());
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    return next();
  },
};
