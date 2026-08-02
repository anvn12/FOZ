import { spawn } from "node:child_process";

const child = spawn("npx", ["drizzle-kit", "migrate"], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: process.platform === "win32",
  env: process.env,
});

let stdoutBuffer = "";
let stderrBuffer = "";

child.stdout?.on("data", (chunk: Buffer) => {
  stdoutBuffer += chunk.toString();
});

child.stderr?.on("data", (chunk: Buffer) => {
  stderrBuffer += chunk.toString();
});

function stripNoticeBlocks(text: string): string {
  return text
    .replace(/\{[\s\S]*?severity_local:\s*'NOTICE'[\s\S]*?\n\}/g, "")
    .replace(/\{[\s\S]*?"severity_local":\s*"NOTICE"[\s\S]*?\n\}/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

child.on("close", (code) => {
  const cleanStdout = stripNoticeBlocks(stdoutBuffer).trim();
  const cleanStderr = stripNoticeBlocks(stderrBuffer).trim();

  if (cleanStdout) {
    console.log(cleanStdout);
  }
  if (cleanStderr) {
    console.error(cleanStderr);
  }

  process.exit(code ?? 0);
});
