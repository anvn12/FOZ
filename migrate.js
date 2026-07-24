import postgres from "postgres";

async function run() {
  const devUrl = "postgres://foz:foz@localhost:5432/foz_dev";
  const testUrl = "postgres://foz:foz@localhost:5432/foz_test";
  
  for (const url of [devUrl, testUrl]) {
    const sql = postgres(url);
    try {
      console.log("Dropping schema public for " + url);
      await sql`DROP SCHEMA public CASCADE;`;
      await sql`CREATE SCHEMA public;`;
    } catch(err) {
      console.error(err);
    }
    await sql.end();
  }
}
run();
