import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { activeUser } from "../middleware/activeUser.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) {
      return next({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "userId is required",
      });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    req.session.userId = user.id;
    res.json({
      data: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", activeUser, (req, res) => {
  res.json({ data: req.user });
});

router.delete("/", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.json({ data: { ok: true } });
  });
});

export default router;
