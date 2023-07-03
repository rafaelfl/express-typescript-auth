import { Application } from "express";

import { config } from "../config";
import authRoutes from "./auth";
import helloRoutes from "./hello";
import protectedRoutes from "./protected";

const { API_VERSION } = config;

/*
 * Routes registration
 */
const routes = (app: Application) => {
  const apiPrefix = `/api/${API_VERSION}`;

  // use the same route for both /hello and /api/v1/hello
  app.use(helloRoutes);
  app.use(apiPrefix, helloRoutes);

  // authentication routes
  app.use(authRoutes);

  // protected routes
  app.use(apiPrefix, protectedRoutes);

  return app;
};

export default routes;
