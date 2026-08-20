import type { Db } from "../client.js";
import {
  posts,
  comments,
  reactions,
  reports,
  type NewPost,
  type NewComment,
  type NewReaction,
} from "../schema/interactions.js";
import { hashtags, postHashtags } from "../schema/hashtags.js";
import { createRng, getDistributedDate } from "./seed-helpers.js";
import type { ReportReasonType, ReportStatus } from "#shared/schema-enums.js";

const samplePostContents = [
  "Welcome to the FOZ community! Excited to connect with everyone here. #foz #announcement",
  "Just migrated our entire backend database to PostgreSQL 16 and Drizzle ORM. The speed improvement is incredible! #tech #database",
  "What is your favorite CSS framework in 2026? Tailwind CSS is still hard to beat for rapid UI iterations. #webdev #react",
  "Building full-stack apps with TypeScript end-to-end gives such peace of mind. #typescript #tech",
  "Working on a new open source library today. Who wants to collaborate? #opensource #tech",
  "Good UI design is not just how it looks, but how it works and feels. Micro-animations make a huge difference! #design #react",
  "Exploring LLM agents and autonomous workflows. The future of software engineering is here. #ai #tech",
  "Quick tip: Always enforce foreign keys and relational integrity at the database layer, not just in application code. #database #tech",
  "Dark mode vs Light mode: which one do you code in most of the time? #design #webdev",
  "Automated testing with Vitest is super fast! Integration tests run in milliseconds. #typescript #tech",
  "Excited to announce our new community roadmap! Check out what we have planned. #foz #announcement",
  "Debugging race conditions in asynchronous code is an art form. #typescript #webdev",
  "Responsive web design check: mobile layout, tablet layout, desktop layout. Always test on real devices! #design #webdev",
  "Anyone attending the upcoming tech conference next month? Let's meet up! #tech #announcement",
  "Refactoring legacy code into clean, modular TypeScript ESM modules. So satisfying! #typescript #opensource",
];

const sampleCommentTexts = [
  "Totally agree with this!",
  "Great post, thanks for sharing your insights.",
  "How did you handle the edge cases for this?",
  "This helped me solve an issue I was having earlier today. Cheers!",
  "Interesting perspective, though I usually take a different approach.",
  "100%! Looking forward to seeing where this goes.",
  "Could you share a code snippet or example for that?",
  "Love this design pattern. Clean and easy to maintain.",
  "Spot on! Adding this to my bookmarks.",
  "Thanks for the breakdown, very well explained.",
];

export async function seedPopulatedInteractions(
  db: Db,
  userIds: string[],
  postCount = 100,
): Promise<void> {
  if (userIds.length === 0) {
    throw new Error("Cannot seed interactions with zero users");
  }

  const rng = createRng(1337);

  console.log("🌱 [seed:populated] Seeding hashtags...");
  const hashtagTags = [
    { name: "foz", displayName: "foz" },
    { name: "tech", displayName: "tech" },
    { name: "announcement", displayName: "announcement" },
    { name: "webdev", displayName: "webdev" },
    { name: "react", displayName: "react" },
    { name: "typescript", displayName: "typescript" },
    { name: "database", displayName: "database" },
    { name: "design", displayName: "design" },
    { name: "ai", displayName: "ai" },
    { name: "opensource", displayName: "opensource" },
  ];

  const createdHashtags = await db
    .insert(hashtags)
    .values(hashtagTags)
    .returning({ id: hashtags.id, name: hashtags.name });

  const hashtagMap = new Map(createdHashtags.map((h) => [h.name, h.id]));

  console.log(`🌱 [seed:populated] Generating ${postCount} posts over 30-day timeline...`);
  const rootPostCount = Math.floor(postCount * 0.85); // 85 root posts
  const repostCount = postCount - rootPostCount; // 15 reposts

  const rootPostInserts: NewPost[] = [];
  for (let i = 0; i < rootPostCount; i++) {
    const authorId = userIds[i % userIds.length]!;
    const content = samplePostContents[i % samplePostContents.length]!;
    const createdAt = getDistributedDate(0.1, 30, rng);

    rootPostInserts.push({
      authorId,
      content,
      visibilityState: "public",
      lifecycleState: "active",
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Sort by createdAt ascending for logical timeline insertion
  rootPostInserts.sort((a, b) => (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime());

  const createdRootPosts = await db
    .insert(posts)
    .values(rootPostInserts)
    .returning({ id: posts.id, authorId: posts.authorId, content: posts.content, createdAt: posts.createdAt });

  // Post Hashtags mapping
  const postHashtagInserts = [];
  for (const post of createdRootPosts) {
    if (!post.content) continue;
    for (const [tag, tagId] of hashtagMap.entries()) {
      if (post.content.includes(`#${tag}`)) {
        postHashtagInserts.push({
          postId: post.id,
          hashtagId: tagId,
        });
      }
    }
  }

  if (postHashtagInserts.length > 0) {
    await db.insert(postHashtags).values(postHashtagInserts).onConflictDoNothing();
  }

  // Create Reposts
  console.log(`🌱 [seed:populated] Generating ${repostCount} reposts...`);
  const repostInserts: NewPost[] = [];
  for (let i = 0; i < repostCount; i++) {
    const targetPost = createdRootPosts[i % createdRootPosts.length]!;
    const authorId = userIds[(i + 7) % userIds.length]!;
    const createdAt = new Date(targetPost.createdAt.getTime() + (i + 1) * 3600 * 1000);

    repostInserts.push({
      authorId,
      content: null,
      repostOfId: targetPost.id,
      visibilityState: "public",
      lifecycleState: "active",
      createdAt,
      updatedAt: createdAt,
    });
  }

  const createdReposts = await db.insert(posts).values(repostInserts).returning({ id: posts.id });
  const allPosts = [...createdRootPosts, ...createdReposts];

  // Generate Top-Level Comments & Nested Replies
  console.log("🌱 [seed:populated] Generating threaded comments and replies...");
  const topLevelCommentInserts: NewComment[] = [];
  for (let i = 0; i < createdRootPosts.length; i++) {
    const targetPost = createdRootPosts[i]!;
    const commentCountForPost = (i % 3) + 1; // 1 to 3 comments per post

    for (let c = 0; c < commentCountForPost; c++) {
      const commenterId = userIds[(i + c + 1) % userIds.length]!;
      const commentTime = new Date(targetPost.createdAt.getTime() + (c + 1) * 1800 * 1000);

      topLevelCommentInserts.push({
        postId: targetPost.id,
        authorId: commenterId,
        body: sampleCommentTexts[(i + c) % sampleCommentTexts.length]!,
        visibilityState: "public",
        lifecycleState: "active",
        createdAt: commentTime,
        updatedAt: commentTime,
      });
    }
  }

  const createdTopComments = await db
    .insert(comments)
    .values(topLevelCommentInserts)
    .returning({ id: comments.id, postId: comments.postId, createdAt: comments.createdAt });

  // Nested Replies (child comments referencing parent comments)
  const nestedReplyInserts: NewComment[] = [];
  for (let i = 0; i < Math.min(50, createdTopComments.length); i++) {
    const parentComment = createdTopComments[i]!;
    const replierId = userIds[(i + 13) % userIds.length]!;
    const replyTime = new Date(parentComment.createdAt.getTime() + 900 * 1000);

    nestedReplyInserts.push({
      postId: parentComment.postId,
      authorId: replierId,
      parentCommentId: parentComment.id,
      body: `Replying to your point: ${sampleCommentTexts[(i + 3) % sampleCommentTexts.length]!}`,
      visibilityState: "public",
      lifecycleState: "active",
      createdAt: replyTime,
      updatedAt: replyTime,
    });
  }

  const createdReplies = await db
    .insert(comments)
    .values(nestedReplyInserts)
    .returning({ id: comments.id, postId: comments.postId, createdAt: comments.createdAt });
  const allComments = [...createdTopComments, ...createdReplies];

  // Generate Reactions (Likes) on Posts and Comments
  console.log("🌱 [seed:populated] Generating reactions (likes)...");
  const reactionInserts: NewReaction[] = [];
  const reactedPairs = new Set<string>();

  // Post reactions
  for (let i = 0; i < createdRootPosts.length; i++) {
    const post = createdRootPosts[i]!;
    const likesCount = (i % 5) + 1; // 1 to 5 likes

    for (let l = 0; l < likesCount; l++) {
      const userAccountId = userIds[(i + l * 3) % userIds.length]!;
      const key = `${userAccountId}_post_${post.id}`;
      if (!reactedPairs.has(key)) {
        reactedPairs.add(key);
        reactionInserts.push({
          userAccountId,
          targetType: "post",
          targetId: post.id,
          reactionKind: "like",
          createdAt: new Date(post.createdAt.getTime() + (l + 1) * 600 * 1000),
        });
      }
    }
  }

  // Comment reactions
  for (let i = 0; i < Math.min(60, allComments.length); i++) {
    const comment = allComments[i]!;
    const userAccountId = userIds[(i + 5) % userIds.length]!;
    const key = `${userAccountId}_comment_${comment.id}`;
    if (!reactedPairs.has(key)) {
      reactedPairs.add(key);
      reactionInserts.push({
        userAccountId,
        targetType: "comment",
        targetId: comment.id,
        reactionKind: "like",
        createdAt: new Date(comment.createdAt.getTime() + 300 * 1000),
      });
    }
  }

  await db.insert(reactions).values(reactionInserts).onConflictDoNothing();

  // Generate Moderation Reports
  console.log("🌱 [seed:populated] Generating sample moderation reports...");
  const reportReasons: ReportReasonType[] = ["spam", "harassment", "inappropriate", "other"];
  const reportInserts = [];

  for (let i = 0; i < 10; i++) {
    const reporterId = userIds[(i + 20) % userIds.length]!;
    const isPostReport = i % 2 === 0;
    const targetId = isPostReport ? createdRootPosts[i]!.id : userIds[(i + 30) % userIds.length]!;
    const targetType = isPostReport ? ("post" as const) : ("user" as const);
    const reasonType = reportReasons[i % reportReasons.length]!;
    const status: ReportStatus = i < 4 ? "open" : i < 7 ? "dismissed" : "closed";

    reportInserts.push({
      reporterId,
      targetType,
      targetId,
      reasonType,
      details: `Test report #${i + 1} filed for testing moderation queue.`,
      status,
    });
  }

  await db.insert(reports).values(reportInserts);

  console.log(
    `✅ [seed:populated] Finished seeding interactions: ${allPosts.length} posts, ${allComments.length} comments, ${reactionInserts.length} reactions, ${reportInserts.length} reports.`,
  );
}
