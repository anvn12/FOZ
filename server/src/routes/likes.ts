import { Router } from "express";
import { activeUser } from "../middleware/activeUser.js";
import * as likeService from "../services/likeService.js";
import { getIo } from "../io.js";

const router = Router();

router.post("/threads/:id/likes", activeUser, async (req, res, next) => {
  try {
    const likeCount = await likeService.likeTarget({
      userId: req.user!.id,
      targetType: "thread",
      targetId: req.params.id,
      io: getIo(),
    });
    res.status(201).json({ data: { likeCount } });
  } catch (err) {
    next(err);
  }
});

router.delete("/threads/:id/likes", activeUser, async (req, res, next) => {
  try {
    const likeCount = await likeService.unlikeTarget({
      userId: req.user!.id,
      targetType: "thread",
      targetId: req.params.id,
      io: getIo(),
    });
    res.json({ data: { likeCount } });
  } catch (err) {
    next(err);
  }
});

router.post("/replies/:id/likes", activeUser, async (req, res, next) => {
  try {
    const likeCount = await likeService.likeTarget({
      userId: req.user!.id,
      targetType: "reply",
      targetId: req.params.id,
      io: getIo(),
    });
    res.status(201).json({ data: { likeCount } });
  } catch (err) {
    next(err);
  }
});

router.delete("/replies/:id/likes", activeUser, async (req, res, next) => {
  try {
    const likeCount = await likeService.unlikeTarget({
      userId: req.user!.id,
      targetType: "reply",
      targetId: req.params.id,
      io: getIo(),
    });
    res.json({ data: { likeCount } });
  } catch (err) {
    next(err);
  }
});

export default router;
