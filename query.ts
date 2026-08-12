import { db } from "./src/backend/db/client.js";
import { userAccounts } from "./src/backend/db/schema/users.js";
import { eq } from "drizzle-orm";

async function run() {
  await db.update(userAccounts).set({ role: "moderator" }).where(eq(userAccounts.email, "khanhtest@gmail.com"));
  const users = await db.select({ email: userAccounts.email, role: userAccounts.role }).from(userAccounts);
  console.log(users);
  process.exit(0);
}
run();
