import { prisma } from "../lib/prisma.js";

function appError(statusCode: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
}

export async function followUser(params: {
  followerId: string;
  followingId: string;
}) {
  if (params.followerId === params.followingId) {
    throw appError(400, "CANNOT_SELF_FOLLOW", "Cannot follow yourself");
  }

  const target = await prisma.user.findUnique({
    where: { id: params.followingId },
  });
  if (!target) {
    throw appError(404, "NOT_FOUND", "User not found");
  }

  try {
    await prisma.follow.create({
      data: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
    });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw appError(409, "ALREADY_FOLLOWING", "Already following");
    }
    throw e;
  }
}

export async function unfollowUser(params: {
  followerId: string;
  followingId: string;
}) {
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
    },
  });
  if (!existing) {
    throw appError(404, "NOT_FOLLOWING", "Not following");
  }
  await prisma.follow.delete({ where: { id: existing.id } });
}

export async function getFollowStatus(params: {
  followerId: string;
  followingId: string;
}) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: params.followerId,
        followingId: params.followingId,
      },
    },
  });
  return { following: !!follow };
}
