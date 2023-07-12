import express from "express";
import cors from "cors";
import createError from "http-errors";
import cookieParser from "cookie-parser";

import redisClient from "./redisDatabase";
import { messages } from "./constants";
import { errorHandler } from "./helpers";

import { connectMongoDB } from "./database";
import httpLogger from "./middleware/http-logger";
import passport from "./middleware/passport";
import routeModules from "./routes";
import { loadConfigVariables } from "./config";

// LOAD ENVIRONMENT VARIABLES
loadConfigVariables();

const app = express();

// Morgan redirected to winston logger
app.use(httpLogger);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// mongoose connection
connectMongoDB();

// ping Redis database to connect
redisClient.ping();

// passport middleware
app.use(passport);

routeModules(app);

// catch 404 and forward to exception handler
app.use((_, __, next) => next(createError(404, messages.NOT_FOUND)));

// exception handlers
app.use(errorHandler);

export default app;
