import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { activeUser } from "../middleware/activeUser.js";
import * as followService from "../services/followService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    res.json({
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/follow-status", activeUser, async (req, res, next) => {
  try {
    const status = await followService.getFollowStatus({
      followerId: req.user!.id,
      followingId: req.params.id,
    });
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/follow", activeUser, async (req, res, next) => {
  try {
    await followService.followUser({
      followerId: req.user!.id,
      followingId: req.params.id,
    });
    res.status(201).json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/follow", activeUser, async (req, res, next) => {
  try {
    await followService.unfollowUser({
      followerId: req.user!.id,
      followingId: req.params.id,
    });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
