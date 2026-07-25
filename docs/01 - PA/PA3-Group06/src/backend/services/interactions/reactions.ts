import { createReaction, removeReaction, getReaction, getPostById, getCommentById, countReactionsForTarget } from "#backend/db/repositories/interactions.js";

export async function likeTarget(args: {
  userAccountId: string;
  targetType: "post" | "comment";
  targetId: string;
}) {
  const target = args.targetType === "post" ? await getPostById(args.targetId) : await getCommentById(args.targetId);
  if (!target || target.visibilityState !== "public" || target.deletedAt) throw new Error("TARGET_NOT_FOUND");
  await createReaction(args);
  return { active: true as const, ...args, likeCount: await countReactionsForTarget(args.targetType, args.targetId) };
}

export async function unlikeTarget(args: {
  userAccountId: string;
  targetType: "post" | "comment";
  targetId: string;
}) {
  const target = args.targetType === "post" ? await getPostById(args.targetId) : await getCommentById(args.targetId);
  if (!target || target.visibilityState !== "public" || target.deletedAt) throw new Error("TARGET_NOT_FOUND");
  const existing = await getReaction(args);
  if (!existing) {
    return { active: false as const, ...args, likeCount: await countReactionsForTarget(args.targetType, args.targetId) };
  }
  await removeReaction(args);
  return { active: false as const, ...args, likeCount: await countReactionsForTarget(args.targetType, args.targetId) };
}
