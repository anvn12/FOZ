import type { Server } from "socket.io";
import { prisma } from "../lib/prisma.js";

function appError(statusCode: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
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
      throw appError(409, "ALREADY_LIKED", "Already liked");
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
  if (params.targetType === "thread") {
    const existing = await prisma.like.findUnique({
      where: {
        userId_threadId: { userId: params.userId, threadId: params.targetId },
      },
    });
    if (!existing) {
      throw appError(404, "NOT_LIKED", "Not liked");
    }

    const likeCount = await prisma.$transaction(async (tx) => {
      await tx.like.delete({ where: { id: existing.id } });
      const updated = await tx.thread.update({
        where: { id: params.targetId },
        data: { likeCount: { decrement: 1 } },
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

  const existing = await prisma.like.findUnique({
    where: {
      userId_replyId: { userId: params.userId, replyId: params.targetId },
    },
  });
  if (!existing) {
    throw appError(404, "NOT_LIKED", "Not liked");
  }

  const likeCount = await prisma.$transaction(async (tx) => {
    await tx.like.delete({ where: { id: existing.id } });
    const updated = await tx.reply.update({
      where: { id: params.targetId },
      data: { likeCount: { decrement: 1 } },
    });
    return updated.likeCount;
  });

  params.io.to("global-feed").emit("like:updated", {
    targetType: "reply",
    targetId: params.targetId,
    likeCount,
  });
  return likeCount;
}
