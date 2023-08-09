import fs from "fs";
import path from "path";
import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import createError from "http-errors";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import yaml from "yaml";

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

// Swagger
const file = fs.readFileSync(path.resolve(__dirname, "../docs/swagger/auth-api.yaml"), "utf8");
const swaggerDocument = yaml.parse(file);

// Morgan redirected to winston logger
app.use(httpLogger);

const allowedList = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://localhost:3000",
  "https://login.rafaelf.dev:3000",
];
const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (allowedList.includes(origin ?? "") || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use(helmet());

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

// define a route for the swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static("public"));

// catch 404 and forward to exception handler
app.use((_, __, next) => next(createError(404, messages.NOT_FOUND)));

// exception handlers
app.use(errorHandler);

export default app;
