import type { Server } from "socket.io";
import { prisma } from "../lib/prisma.js";

function appError(statusCode: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
}

async function currentThreadLikeCount(threadId: string): Promise<number> {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { likeCount: true },
  });
  if (!thread) throw appError(404, "NOT_FOUND", "Thread not found");
  return thread.likeCount;
}

async function currentReplyLikeCount(replyId: string): Promise<number> {
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { likeCount: true },
  });
  if (!reply) throw appError(404, "NOT_FOUND", "Reply not found");
  return reply.likeCount;
}

async function findLikeForTarget(params: {
  userId: string;
  targetType: "thread" | "reply";
  targetId: string;
}) {
  if (params.targetType === "thread") {
    return prisma.like.findFirst({
      where: { userId: params.userId, threadId: params.targetId },
    });
  }
  return prisma.like.findFirst({
    where: { userId: params.userId, replyId: params.targetId },
  });
}

export async function likeTarget(params: {
  userId: string;
  targetType: "thread" | "reply";
  targetId: string;
  io: Server;
}) {
  try {
    if (params.targetType === "thread") {
      const thread = await prisma.thread.findUnique({
        where: { id: params.targetId },
      });
      if (!thread) throw appError(404, "NOT_FOUND", "Thread not found");

      const likeCount = await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: { userId: params.userId, threadId: params.targetId },
        });
        const updated = await tx.thread.update({
          where: { id: params.targetId },
          data: { likeCount: { increment: 1 } },
        });
        return updated.likeCount;
      });

      params.io.to("global-feed").emit("like:updated", {
        targetType: "thread",
        targetId: params.targetId,
        likeCount,
      });
      return likeCount;
    }

    const reply = await prisma.reply.findUnique({
      where: { id: params.targetId },
    });
    if (!reply) throw appError(404, "NOT_FOUND", "Reply not found");

    const likeCount = await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: { userId: params.userId, replyId: params.targetId },
      });
      const updated = await tx.reply.update({
        where: { id: params.targetId },
        data: { likeCount: { increment: 1 } },
      });
      return updated.likeCount;
    });

    params.io.to("global-feed").emit("like:updated", {
      targetType: "reply",
      targetId: params.targetId,
      likeCount,
    });
    return likeCount;
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      const existing = await findLikeForTarget(params);
      if (existing) {
        const likeCount =
          params.targetType === "thread"
            ? await currentThreadLikeCount(params.targetId)
            : await currentReplyLikeCount(params.targetId);
        return likeCount;
      }
      console.error("Like create failed with unexpected unique violation", e);
    }
    throw e;
  }
}

export async function unlikeTarget(params: {
  userId: string;
  targetType: "thread" | "reply";
  targetId: string;
  io: Server;
}) {
  const existing = await findLikeForTarget(params);
  if (!existing) {
    return params.targetType === "thread"
      ? currentThreadLikeCount(params.targetId)
      : currentReplyLikeCount(params.targetId);
  }

  const likeCount = await prisma.$transaction(async (tx) => {
    await tx.like.delete({ where: { id: existing.id } });
    if (params.targetType === "thread") {
      const updated = await tx.thread.update({
        where: { id: params.targetId },
        data: { likeCount: { decrement: 1 } },
      });
      return updated.likeCount;
    }
    const updated = await tx.reply.update({
      where: { id: params.targetId },
      data: { likeCount: { decrement: 1 } },
    });
    return updated.likeCount;
  });

  params.io.to("global-feed").emit("like:updated", {
    targetType: params.targetType,
    targetId: params.targetId,
    likeCount,
  });
  return likeCount;
}
