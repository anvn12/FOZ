import { Router } from "express";
import { activeUser } from "../middleware/activeUser.js";
import * as replyService from "../services/replyService.js";
import { getIo } from "../io.js";

const router = Router();

router.post("/threads/:threadId/replies", activeUser, async (req, res, next) => {
  try {
    const { content } = req.body as { content?: string };
    const reply = await replyService.createReply({
      authorId: req.user!.id,
      threadId: req.params.threadId,
      content: content ?? "",
      io: getIo(),
    });
    res.status(201).json({ data: reply });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", activeUser, async (req, res, next) => {
  try {
    await replyService.deleteReply({
      userId: req.user!.id,
      replyId: req.params.id,
      io: getIo(),
    });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
