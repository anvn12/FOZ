import { db } from "./src/backend/db/client.js";
import { userAccounts, profiles } from "./src/backend/db/schema/users.js";
import { posts, comments, reactions, reports } from "./src/backend/db/schema/interactions.js";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Seeding sample data...");
  const passwordHash = await hash("password123", 10);

  // 1. Create Accounts
  const usersToCreate = [
    { email: "admin@foz.com", role: "administrator", displayName: "Admin User", bio: "Platform administrator." },
    { email: "mod@foz.com", role: "moderator", displayName: "Moderator User", bio: "Community moderator keeping things clean." },
    { email: "alex@foz.com", role: "standard", displayName: "Alex Johnson", bio: "Software Engineer & Tech enthusiast." },
    { email: "sarah@foz.com", role: "standard", displayName: "Sarah Connor", bio: "UI/UX Designer & Digital Nomad." },
    { email: "david@foz.com", role: "standard", displayName: "David Smith", bio: "Full-stack developer building cool apps." },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of usersToCreate) {
    const existing = await db.select().from(userAccounts).where(eq(userAccounts.email, u.email)).catch(() => []);
    let userId = existing[0]?.id;

    if (!userId) {
      const [user] = await db.insert(userAccounts).values({
        email: u.email,
        passwordHash,
        role: u.role as any,
        status: "active",
      }).returning();

      userId = user.id;

      await db.insert(profiles).values({
        userAccountId: userId,
        displayName: u.displayName,
        bio: u.bio,
      });
    }

    createdUsers[u.email] = userId;
  }

  // 2. Create Sample Posts
  const samplePosts = [
    {
      authorEmail: "alex@foz.com",
      content: "Just started exploring the new FOZ platform! The UI and speed feel super slick 🚀 #welcome",
    },
    {
      authorEmail: "sarah@foz.com",
      content: "Design systems are more than just component libraries; they are a visual language for your brand identity.",
    },
    {
      authorEmail: "david@foz.com",
      content: "TypeScript 5.x brings so many nice quality-of-life enhancements for full-stack developers!",
    },
    {
      authorEmail: "alex@foz.com",
      content: "Anyone else attending the upcoming web tech conference next month? Let's connect!",
    },
    {
      authorEmail: "sarah@foz.com",
      content: "This is a suspicious promotional post offering fake crypto giveaways! Click here for 100x gains! 🚨",
    },
  ];

  const createdPostIds: string[] = [];

  for (const p of samplePosts) {
    const authorId = createdUsers[p.authorEmail]!;
    const [insertedPost] = await db.insert(posts).values({
      authorId,
      content: p.content,
      visibilityState: "public",
      lifecycleState: "active",
    }).returning();
    createdPostIds.push(insertedPost.id);
  }

  // 3. Create Sample Reactions & Comments
  if (createdPostIds.length >= 3) {
    await db.insert(reactions).values([
      { userAccountId: createdUsers["sarah@foz.com"]!, targetType: "post", targetId: createdPostIds[0]!, reactionKind: "like" },
      { userAccountId: createdUsers["david@foz.com"]!, targetType: "post", targetId: createdPostIds[0]!, reactionKind: "like" },
      { userAccountId: createdUsers["alex@foz.com"]!, targetType: "post", targetId: createdPostIds[1]!, reactionKind: "like" },
    ]);

    await db.insert(comments).values([
      { postId: createdPostIds[0]!, authorId: createdUsers["sarah@foz.com"]!, body: "Totally agree! Great job team!", visibilityState: "public", lifecycleState: "active" },
      { postId: createdPostIds[0]!, authorId: createdUsers["david@foz.com"]!, body: "Super smooth user experience.", visibilityState: "public", lifecycleState: "active" },
    ]);
  }

  // 4. Create Sample Report (for the suspicious post)
  if (createdPostIds[4]) {
    await db.insert(reports).values({
      reporterId: createdUsers["david@foz.com"]!,
      targetType: "post",
      targetId: createdPostIds[4]!,
      reasonType: "spam",
      details: "Spam crypto giveaway post violating community rules.",
      status: "open",
    });
  }

  console.log("Seed complete!");
  console.log("Accounts created (password for all is 'password123'):");
  console.log(" - Admin: admin@foz.com");
  console.log(" - Moderator: mod@foz.com");
  console.log(" - Alex Johnson: alex@foz.com");
  console.log(" - Sarah Connor: sarah@foz.com");
  console.log(" - David Smith: david@foz.com");

  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
