import { Application } from "express";
import { API_VERSION } from "../constants";

import helloRoute from "./hello";

/*
 * Routes registration
 */
const routes = (app: Application) => {
  const apiPrefix = `/api/${API_VERSION}`;

  // use the same route for both / and /api/v1/hello
  app.use(helloRoute);
  app.use(apiPrefix, helloRoute);

  return app;
};

export default routes;
