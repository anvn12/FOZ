import type { ErrorRequestHandler } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const e = err as AppError;
  const statusCode = e.statusCode ?? 500;
  const code = e.code ?? "INTERNAL_ERROR";
  const message = e.message ?? "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: { message, code },
  });
};

export default errorHandler;
