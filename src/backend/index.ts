import { pathToFileURL } from "node:url";
import express, { Router, type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ZodError } from "zod";
import { env, getFrontendUrl } from "#backend/env.js";
import { authRouter } from "#backend/api/auth/routes.js";
import { postRouter } from "#backend/api/posts/routes.js";
import { commentRouter } from "#backend/api/comments/routes.js";
import { reactionRouter } from "#backend/api/reactions/routes.js";
import { AuthError } from "#backend/api/auth/auth.service.js";
import { profileRouter } from "#backend/api/profile/routes.js";
import { searchRouter } from "#backend/api/search/routes.js";
import { moderationRouter } from "#backend/api/moderation/routes.js";
import { uploadRouter } from "#backend/api/upload/routes.js";
import { adminRouter } from "#backend/api/admin/routes.js";
import { hashtagRouter } from "#backend/api/hashtags/routes.js";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static("uploads"));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
      credentials: true,
    }),
  );

  // Mount all API routes under /api/v1. Add new sub-routers here — no need
  // to write the prefix on each one.
  const apiRouter = Router();
  apiRouter.use("/auth", authRouter);
  apiRouter.use("/posts", postRouter);
  apiRouter.use("/", commentRouter);
  apiRouter.use("/", reactionRouter);
  apiRouter.use("/profiles", profileRouter);
  apiRouter.use("/search", searchRouter);
  apiRouter.use("/moderation", moderationRouter);
  apiRouter.use("/upload", uploadRouter);
  apiRouter.use("/admin", adminRouter);
  apiRouter.use("/hashtags", hashtagRouter);
  app.use("/api/v1", apiRouter);

  app.get("/api/v1/health", (_req, res) => res.status(200).json({ ok: true }));

  app.get("/", (req, res) => {
    const frontendUrl = getFrontendUrl();
    const host = req.headers.host || "";
    // If request contains a token query param (e.g., from an misdirected OAuth redirect),
    // redirect to the actual frontend URL if configured and not matching current backend host.
    if (req.query.token && frontendUrl && !frontendUrl.includes(host)) {
      const token = encodeURIComponent(String(req.query.token));
      return res.redirect(`${frontendUrl}/?token=${token}`);
    }
    return res.status(200).json({ ok: true, message: "FOZ API Backend" });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  // Central error handler. ponytail: this is the only place that turns
  // thrown errors into HTTP responses; services throw typed errors, this
  // maps them. Add new mapping arms as new AuthError subclasses appear.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (typeof err === "object" && err !== null && "status" in err && err.status === 413) {
      return res.status(413).json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request payload exceeds maximum allowed size limit",
        },
      });
    }
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
