import express from "express";
import createError from "http-errors";

import { messages } from "./constants";
import { errorHandler } from "./helpers/index";

import httpLogger from "./middleware/http-logger";
import routeModules from "./routes";

const { NOT_FOUND } = messages;

const app = express();

// Morgan logger redirected to winston logger
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

routeModules(app);

// catch 404 and forward to exception handler
app.use((_, __, next) => next(createError(404, NOT_FOUND)));

// exception handlers
app.use(errorHandler);

export default app;
