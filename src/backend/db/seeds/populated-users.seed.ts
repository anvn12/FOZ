import type { Db } from "../client.js";
import { userAccounts, profiles, type NewUserAccount, type NewProfile } from "../schema/users.js";

const sampleBios = [
  "Frontend developer & UI enthusiast. Love React and Tailwind CSS.",
  "Building distributed systems and exploring high-scale database architectures.",
  "Open-source contributor, coffee lover, and digital nomad.",
  "AI researcher passionate about ethical AI and LLM agents.",
  "Full-stack engineer focusing on TypeScript, Drizzle ORM, and PostgreSQL.",
  "Product designer crafting human-centric digital experiences.",
  "DevOps engineer automating everything with Docker and Kubernetes.",
  "Security enthusiast & ethical hacker. Keeping the web secure.",
  "Mobile app builder passionate about performance and micro-interactions.",
  "Data scientist turning massive datasets into actionable insights.",
];

const sampleLocations = [
  "San Francisco, CA",
  "New York, NY",
  "London, UK",
  "Berlin, Germany",
  "Tokyo, Japan",
  "Toronto, Canada",
  "Sydney, Australia",
  "Amsterdam, Netherlands",
  "Singapore",
  "Austin, TX",
];

export async function seedPopulatedUsers(
  db: Db,
  userPasswordHash: string,
  userCount = 50,
): Promise<string[]> {
  console.log(`🌱 [seed:populated] Generating ${userCount} synthetic users and profiles...`);

  const userAccountInserts: NewUserAccount[] = [];
  for (let i = 1; i <= userCount; i++) {
    userAccountInserts.push({
      email: `user${i}@foz.test`,
      username: `user_${i}`,
      passwordHash: userPasswordHash,
      role: "standard",
      status: "active",
    });
  }

  const createdUsers = await db
    .insert(userAccounts)
    .values(userAccountInserts)
    .returning({ id: userAccounts.id, username: userAccounts.username });

  const profileInserts: NewProfile[] = createdUsers.map((user, idx) => {
    const num = idx + 1;
    const bio = sampleBios[idx % sampleBios.length];
    const location = sampleLocations[idx % sampleLocations.length];

    return {
      userAccountId: user.id,
      displayName: `Test User ${num}`,
      bio,
      location,
      website: `https://user${num}.foz.test`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${num}`,
    };
  });

  await db.insert(profiles).values(profileInserts);

  console.log(`✅ [seed:populated] Created ${createdUsers.length} user accounts and profiles.`);
  return createdUsers.map((u) => u.id);
}
