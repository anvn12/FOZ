import type { Server } from "socket.io";
import { prisma } from "../lib/prisma.js";

function appError(statusCode: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
}

export async function getPaginatedFeed(params: {
  userId?: string;
  cursor?: string;
  limit?: number;
}) {
  const limit = Math.min(params.limit ?? 20, 50);

  const threads = await prisma.thread.findMany({
    take: limit + 1,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor },
          skip: 1,
        }
      : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
    },
  });

  let nextCursor: string | null = null;
  let page = threads;
  if (threads.length > limit) {
    const last = threads[limit - 1];
    nextCursor = last.id;
    page = threads.slice(0, limit);
  }

  const enriched = await Promise.all(
    page.map(async (thread) => {
      let likedByMe = false;
      let followingAuthor = false;

      if (params.userId) {
        const [like, follow] = await Promise.all([
          prisma.like.findUnique({
            where: {
              userId_threadId: { userId: params.userId, threadId: thread.id },
            },
          }),
          prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: params.userId,
                followingId: thread.authorId,
              },
            },
          }),
        ]);
        likedByMe = !!like;
        followingAuthor = !!follow;
      }

      const replies = await Promise.all(
        thread.replies.map(async (reply) => {
          let replyLikedByMe = false;
          if (params.userId) {
            const rLike = await prisma.like.findUnique({
              where: {
                userId_replyId: { userId: params.userId, replyId: reply.id },
              },
            });
            replyLikedByMe = !!rLike;
          }
          return {
            id: reply.id,
            content: reply.content,
            likeCount: reply.likeCount,
            createdAt: reply.createdAt.toISOString(),
            author: {
              id: reply.author.id,
              name: reply.author.name,
              avatarUrl: reply.author.avatarUrl,
            },
            likedByMe: replyLikedByMe,
          };
        }),
      );

      return {
        id: thread.id,
        content: thread.content,
        imageUrl: thread.imageUrl,
        likeCount: thread.likeCount,
        replyCount: thread.replyCount,
        createdAt: thread.createdAt.toISOString(),
        author: {
          id: thread.author.id,
          name: thread.author.name,
          avatarUrl: thread.author.avatarUrl,
        },
        replies,
        likedByMe,
        followingAuthor,
      };
    }),
  );

  return { threads: enriched, nextCursor };
}

export async function createThread(params: {
  authorId: string;
  content: string;
  imageUrl?: string | null;
}) {
  const trimmed = params.content.trim();
  if (trimmed.length > 500) {
    throw appError(400, "CONTENT_TOO_LONG", "Content exceeds 500 characters");
  }
  if (!trimmed && !params.imageUrl) {
    throw appError(400, "EMPTY_THREAD", "Thread must have text or an image");
  }

  const thread = await prisma.thread.create({
    data: {
      authorId: params.authorId,
      content: trimmed || "(image)",
      imageUrl: params.imageUrl ?? null,
    },
    include: { author: true },
  });

  return {
    id: thread.id,
    content: thread.content,
    imageUrl: thread.imageUrl,
    likeCount: thread.likeCount,
    replyCount: thread.replyCount,
    createdAt: thread.createdAt.toISOString(),
    author: {
      id: thread.author.id,
      name: thread.author.name,
      avatarUrl: thread.author.avatarUrl,
    },
  };
}

export async function deleteThread(params: {
  userId: string;
  threadId: string;
  io: Server;
}) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.threadId },
  });
  if (!thread) {
    throw appError(404, "NOT_FOUND", "Thread not found");
  }
  if (thread.authorId !== params.userId) {
    throw appError(403, "NOT_OWNER", "Not authorized to delete this thread");
  }

  await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({ where: { threadId: params.threadId } });
    const replyIds = (
      await tx.reply.findMany({
        where: { threadId: params.threadId },
        select: { id: true },
      })
    ).map((r) => r.id);
    if (replyIds.length) {
      await tx.like.deleteMany({ where: { replyId: { in: replyIds } } });
    }
    await tx.reply.deleteMany({ where: { threadId: params.threadId } });
    await tx.thread.delete({ where: { id: params.threadId } });
  });
  params.io.to("global-feed").emit("thread:deleted", { threadId: params.threadId });
}
