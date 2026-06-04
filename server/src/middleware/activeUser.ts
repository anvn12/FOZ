import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";

export const activeUser: RequestHandler = async (req, _res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return next({
      statusCode: 401,
      code: "NO_SESSION",
      message: "No active session",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return next({
      statusCode: 401,
      code: "NO_SESSION",
      message: "No active session",
    });
  }

  req.user = {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
  next();
};
