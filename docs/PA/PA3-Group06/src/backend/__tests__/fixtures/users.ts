import { randomBytes } from "node:crypto";

export function uniqueEmail(prefix = "user"): string {
  return `${prefix}_${randomBytes(4).toString("hex")}@test.local`;
}

export function uniquePassword(): string {
  return `P@ssw0rd_${randomBytes(6).toString("hex")}`;
}
