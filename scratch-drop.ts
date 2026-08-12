import postgres from 'postgres';
import { config } from 'dotenv';
config();
const sql = postgres(process.env.DATABASE_URL!);
async function run() {
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  process.exit(0);
}
run();
