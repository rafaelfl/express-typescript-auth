import { Application } from "express";

import { config } from "../config";
import authRoutes from "./auth";
import helloRoutes from "./hello";
import adminRoutes from "./admin";
import protectedRoutes from "./protected";

const { API_VERSION } = config;

/*
 * Routes registration
 */
const routes = (app: Application) => {
  const apiPrefix = `/api/${API_VERSION}`;

  // use the same route for both /hello and /api/v1/hello
  app.use(helloRoutes);

  // authentication routes
  app.use(authRoutes);

  // protected routes
  app.use(apiPrefix, protectedRoutes);

  // admin routes
  app.use(`${apiPrefix}/admin`, adminRoutes);

  return app;
};

export default routes;
