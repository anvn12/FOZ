import type { Server } from "socket.io";
import { prisma } from "../lib/prisma.js";

function appError(statusCode: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
}

export async function createReply(params: {
  authorId: string;
  threadId: string;
  content: string;
  io: Server;
}) {
  const trimmed = params.content.trim();
  if (!trimmed) {
    throw appError(400, "CONTENT_REQUIRED", "Reply content is required");
  }
  if (trimmed.length > 500) {
    throw appError(400, "CONTENT_TOO_LONG", "Content exceeds 500 characters");
  }

  const thread = await prisma.thread.findUnique({
    where: { id: params.threadId },
  });
  if (!thread) {
    throw appError(404, "THREAD_NOT_FOUND", "Thread not found");
  }

  const reply = await prisma.$transaction(async (tx) => {
    const created = await tx.reply.create({
      data: {
        threadId: params.threadId,
        authorId: params.authorId,
        content: trimmed,
      },
      include: { author: true },
    });
    const updated = await tx.thread.update({
      where: { id: params.threadId },
      data: { replyCount: { increment: 1 } },
    });
    return { created, replyCount: updated.replyCount };
  });

  params.io.to("global-feed").emit("reply:count-updated", {
    threadId: params.threadId,
    replyCount: reply.replyCount,
  });

  return {
    id: reply.created.id,
    threadId: reply.created.threadId,
    content: reply.created.content,
    likeCount: reply.created.likeCount,
    createdAt: reply.created.createdAt.toISOString(),
    author: {
      id: reply.created.author.id,
      name: reply.created.author.name,
      avatarUrl: reply.created.author.avatarUrl,
    },
  };
}

export async function deleteReply(params: {
  userId: string;
  replyId: string;
  io: Server;
}) {
  const reply = await prisma.reply.findUnique({
    where: { id: params.replyId },
  });
  if (!reply) {
    throw appError(404, "NOT_FOUND", "Reply not found");
  }
  if (reply.authorId !== params.userId) {
    throw appError(403, "NOT_OWNER", "Not authorized to delete this reply");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({ where: { replyId: params.replyId } });
    await tx.reply.delete({ where: { id: params.replyId } });
    const updated = await tx.thread.update({
      where: { id: reply.threadId },
      data: { replyCount: { decrement: 1 } },
    });
    return updated.replyCount;
  });

  params.io.to("global-feed").emit("reply:deleted", {
    replyId: params.replyId,
    threadId: reply.threadId,
  });
  params.io.to("global-feed").emit("reply:count-updated", {
    threadId: reply.threadId,
    replyCount: result,
  });
}
