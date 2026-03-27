import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((value) => value.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res
      .status(200)
      .type("html")
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Civic Intelligence Backend</title>
    <style>
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #020617; color: #e2e8f0; }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .card { max-width: 720px; width: 100%; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px; background: rgba(15, 23, 42, 0.7); box-shadow: 0 30px 80px rgba(0,0,0,0.35); }
      h1 { margin: 0 0 12px; font-size: 32px; letter-spacing: -0.03em; }
      p { margin: 0 0 14px; color: #cbd5e1; line-height: 1.6; }
      code, a { color: #67e8f9; }
      ul { margin: 18px 0 0; padding-left: 18px; color: #e2e8f0; }
      li { margin: 8px 0; }
      .pill { display: inline-block; margin-bottom: 18px; padding: 6px 10px; border-radius: 999px; background: rgba(34,211,238,0.12); color: #67e8f9; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="pill">Backend online</div>
        <h1>Civic Intelligence API</h1>
        <p>This server provides the backend for the civic platform. Open the frontend on <code>http://localhost:5173</code> and use the API below from the app or manually.</p>
        <ul>
          <li><code>GET /api/health</code></li>
          <li><code>GET /api/projects</code></li>
          <li><code>GET /api/projects/nearby?lat=&lng=&radiusKm=</code></li>
          <li><code>GET /api/projects/:id</code></li>
          <li><code>POST /api/report</code></li>
          <li><code>POST /api/admin/project</code></li>
        </ul>
      </div>
    </div>
  </body>
</html>`);
  });

  app.use("/api", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
