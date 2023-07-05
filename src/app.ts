import express from "express";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { messages } from "./constants";
import { errorHandler } from "./helpers";

import { connect } from "./database";
import httpLogger from "./middleware/http-logger";
import passport from "./middleware/passport";
import routeModules from "./routes";
import { loadConfigVariables } from "./config";

dotenv.config();

// LOAD ENVIRONMENT VARIABLES
loadConfigVariables();

const app = express();

// Morgan redirected to winston logger
app.use(httpLogger);

// Let's avoid any CORS issue for now ;)
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// mongoose connection
connect();

// passport middleware
app.use(passport);

routeModules(app);

// catch 404 and forward to exception handler
app.use((_, __, next) => next(createError(404, messages.NOT_FOUND)));

// exception handlers
app.use(errorHandler);

export default app;
