import { createClient } from "redis";

import { logger } from "../helpers";
import { config, loadConfigVariables } from "../config";

loadConfigVariables();

const { redisUrl } = config;

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("connect", () => logger.info("Redis client connected"));
redisClient.on("error", err => logger.error("Redis Client Error", err));

redisClient.connect();

export default redisClient;
