import { Router } from "express";
import { activeUser } from "../middleware/activeUser.js";
import * as threadService from "../services/threadService.js";
import { getIo } from "../io.js";
import { upload } from "../lib/upload.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const userId = req.session.userId;

    const result = await threadService.getPaginatedFeed({
      userId,
      cursor,
      limit,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/", activeUser, upload.single("image"), async (req, res, next) => {
  try {
    const file = req.file;
    const content = (req.body.content as string) ?? "";
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    const thread = await threadService.createThread({
      authorId: req.user!.id,
      content,
      imageUrl,
    });
    res.status(201).json({ data: thread });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", activeUser, async (req, res, next) => {
  try {
    await threadService.deleteThread({
      userId: req.user!.id,
      threadId: req.params.id,
      io: getIo(),
    });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
