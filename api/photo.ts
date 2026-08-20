import { get } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAdmin, prepare, sendJson } from "./_shared.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const prepared = prepare(request, response);
  if (prepared.done) return;
  if (request.method !== "GET") return sendJson(response, { error: "Method not allowed" }, 405);
  if (!(await isAdmin(request))) return sendJson(response, { error: "Unauthorized" }, 401);
  const raw = Array.isArray(request.query.pathname) ? request.query.pathname[0] : request.query.pathname;
  const pathname = String(raw ?? "");
  if (!pathname.startsWith("photos/")) return sendJson(response, { error: "Invalid pathname" }, 400);
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return sendJson(response, { error: "Not found" }, 404);
  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  response.setHeader("Content-Type", result.blob.contentType);
  response.setHeader("Content-Length", String(result.blob.size));
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  response.setHeader("Content-Disposition", "inline");
  response.setHeader("X-Content-Type-Options", "nosniff");
  return response.status(200).send(buffer);
}
