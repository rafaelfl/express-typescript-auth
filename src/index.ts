/**
 * Module dependencies.
 */
import { createServer } from "http";
import dotenv from "dotenv";

import app from "./app";

interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

// loading .env and .env.local
dotenv.config();
dotenv.config({ path: ".env.local" });

/**
 * Get port from environment and store in Express.
 */
let port = parseInt(process.env.PORT ?? "0", 10) || 3000;
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error: ErrnoException) => {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      port += 1;
      console.error(`${bind} is already in use, trying ${port}`);
      server.listen(port);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const address = server.address();
  const bind = typeof address === "string" ? `pipe ${address}` : `port: ${address?.port}`;

  console.info(`🚀 We are live on ${bind}`);
};

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
