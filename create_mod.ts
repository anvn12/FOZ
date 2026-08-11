import { db } from "./src/backend/db/client.js";
import { userAccounts, profiles } from "./src/backend/db/schema/users.js";
import { hash } from "bcrypt";

async function run() {
  const p1 = await hash("pass123", 10);
  const [modUser] = await db.insert(userAccounts).values({
    email: "mod@foz.com",
    passwordHash: p1,
    role: "moderator",
    status: "active",
  }).returning();
  await db.insert(profiles).values({ userAccountId: modUser.id, displayName: "Moderator" });
  console.log("Created mod@foz.com with password: pass123");
  process.exit(0);
}
run();
