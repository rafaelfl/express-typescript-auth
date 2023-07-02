import { Application } from "express";

import { config } from "../config";
import helloRoute from "./hello";

const { API_VERSION } = config;

/*
 * Routes registration
 */
const routes = (app: Application) => {
  const apiPrefix = `/api/${API_VERSION}`;

  // use the same route for both /hello and /api/v1/hello
  app.use(helloRoute);
  app.use(apiPrefix, helloRoute);

  return app;
};

export default routes;
