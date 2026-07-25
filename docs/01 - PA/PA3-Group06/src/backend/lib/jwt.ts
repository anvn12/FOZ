import jwt from "jsonwebtoken";
import { env } from "#backend/env";

export type AccessTokenPayload = {
  sub: string;
  role: string;
  status: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL_MIN * 60,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return {
    sub: decoded.sub,
    role: String(decoded.role ?? ""),
    status: String(decoded.status ?? ""),
  };
}
