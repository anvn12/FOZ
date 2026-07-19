import { pathToFileURL } from "node:url";
import express, { Router, type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ZodError } from "zod";
import { env } from "#backend/env.js";
import { authRouter } from "#backend/api/auth/routes.js";
import { AuthError } from "#backend/api/auth/auth.service.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Mount all API routes under /api/v1. Add new sub-routers here — no need
  // to write the prefix on each one.
  const apiRouter = Router();
  apiRouter.use("/auth", authRouter);
  app.use("/api/v1", apiRouter);

  app.get("api/v1/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  // Central error handler. ponytail: this is the only place that turns
  // thrown errors into HTTP responses; services throw typed errors, this
  // maps them. Add new mapping arms as new AuthError subclasses appear.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of err.issues) {
        fields[issue.path.join(".") || "_"] = issue.message;
      }
      return res
        .status(422)
        .json({ error: { code: "VALIDATION", message: "Invalid request", fields } });
    }
    if (err instanceof AuthError) {
      return res
        .status(err.status)
        .json({ error: { code: err.code, message: "Authentication failed" } });
    }
    console.error("unhandled error:", err);
    res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
  });

  return app;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const app = createApp();
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`foz api listening on :${port}`);
  });
}
