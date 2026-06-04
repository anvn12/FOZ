import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AVATARS = {
  alice: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  bob: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  carlos: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  diana: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
  eve: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
};

async function main() {
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: { name: "Alice", avatarUrl: AVATARS.alice },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob", avatarUrl: AVATARS.bob },
  });
  const carlos = await prisma.user.create({
    data: { name: "Carlos", avatarUrl: AVATARS.carlos },
  });
  const diana = await prisma.user.create({
    data: { name: "Diana", avatarUrl: AVATARS.diana },
  });
  const eve = await prisma.user.create({
    data: { name: "Eve", avatarUrl: AVATARS.eve },
  });

  const users = [alice, bob, carlos, diana, eve];

  const threadContents = [
    [alice, "Welcome to FOZ! This is our Threads-style prototype."],
    [bob, "Just shipped a small feature. Feels good."],
    [carlos, "Anyone else debugging infinite scroll today?"],
    [diana, "Photo dump from the weekend — more soon."],
    [eve, "Hot take: tabs > spaces. Discuss."],
    [alice, "Reminder: pick your user at launch, no passwords needed."],
    [bob, "Lunch break thread. What are you building?"],
    [carlos, "Real-time like counts are live. Try two browser tabs."],
    [diana, "Follow your favorites — social graph is in."],
    [eve, "500 characters is plenty for a thought."],
    [alice, "Seed data makes demos so much easier."],
    [bob, "Reply chains should show a subtle connector line."],
    [carlos, "Delete only your own posts — UI gated, prototype trust."],
    [diana, "Refresh the feed without losing your session."],
    [eve, "Self-likes are allowed here. No judgment."],
  ] as const;

  const threads = [];
  for (let i = 0; i < threadContents.length; i++) {
    const [author, content] = threadContents[i];
    const t = await prisma.thread.create({
      data: {
        authorId: author.id,
        content,
        createdAt: new Date(Date.now() - i * 3600_000),
      },
    });
    threads.push(t);
  }

  const replyData = [
    [threads[0], bob, "Great to be here!"],
    [threads[0], carlos, "Nice intro thread."],
    [threads[1], alice, "Congrats on the ship!"],
    [threads[2], diana, "IntersectionObserver is your friend."],
    [threads[2], eve, "Also check cursor pagination."],
    [threads[4], bob, "Hard disagree but respect."],
    [threads[6], carlos, "Building a feed UI."],
    [threads[7], alice, "Socket.io room: global-feed"],
    [threads[8], eve, "Following works per session."],
    [threads[11], diana, "The border-l connector looks clean."],
  ] as const;

  for (const [thread, author, content] of replyData) {
    await prisma.reply.create({
      data: { threadId: thread.id, authorId: author.id, content },
    });
    await prisma.thread.update({
      where: { id: thread.id },
      data: { replyCount: { increment: 1 } },
    });
  }

  await prisma.like.create({
    data: { userId: alice.id, threadId: threads[0].id },
  });
  await prisma.thread.update({
    where: { id: threads[0].id },
    data: { likeCount: 1 },
  });

  await prisma.like.create({
    data: { userId: bob.id, threadId: threads[1].id },
  });
  await prisma.thread.update({
    where: { id: threads[1].id },
    data: { likeCount: 1 },
  });

  await prisma.like.create({
    data: { userId: eve.id, threadId: threads[14].id },
  });
  await prisma.thread.update({
    where: { id: threads[14].id },
    data: { likeCount: 1 },
  });

  const firstReply = await prisma.reply.findFirst({
    where: { threadId: threads[0].id },
  });
  if (firstReply) {
    await prisma.like.create({
      data: { userId: diana.id, replyId: firstReply.id },
    });
    await prisma.reply.update({
      where: { id: firstReply.id },
      data: { likeCount: 1 },
    });
  }

  await prisma.follow.create({
    data: { followerId: alice.id, followingId: bob.id },
  });
  await prisma.follow.create({
    data: { followerId: bob.id, followingId: carlos.id },
  });
  await prisma.follow.create({
    data: { followerId: carlos.id, followingId: diana.id },
  });
  await prisma.follow.create({
    data: { followerId: eve.id, followingId: alice.id },
  });

  console.log(`Seeded ${users.length} users, ${threads.length} threads`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
