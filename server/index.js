import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase } from "./db/pool.js";

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`Civic intelligence backend listening on http://${env.HOST}:${env.PORT}`);
});

server.on("error", (error) => {
  console.error("Civic intelligence backend failed to start:", {
    code: error.code,
    message: error.message,
    host: env.HOST,
    port: env.PORT,
  });
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(async () => {
    await closeDatabase().catch(() => {});
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
