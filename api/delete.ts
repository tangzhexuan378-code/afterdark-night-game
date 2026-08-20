import { del } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bodyObject, isAdmin, prepare, sendJson } from "./_shared.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const prepared = prepare(request, response);
  if (prepared.done) return;
  if (request.method !== "DELETE") return sendJson(response, { error: "Method not allowed" }, 405);
  if (!(await isAdmin(request))) return sendJson(response, { error: "Unauthorized" }, 401);
  const payload = bodyObject(request);
  const photoPath = String(payload.photoPath ?? ""); const metadataPath = String(payload.metadataPath ?? "");
  if (!photoPath.startsWith("photos/") || !metadataPath.startsWith("submissions/")) return sendJson(response, { error: "Invalid deletion target" }, 400);
  await del([photoPath, metadataPath]);
  return sendJson(response, { ok: true });
}
