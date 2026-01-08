import crypto from "crypto";

export function generateId(length = 16) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}
