import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bodyObject, cleanId, cleanText, deviceType, isAllowedOrigin, prepare, requestOrigin, sendJson } from "./_shared.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const prepared = prepare(request, response);
  if (prepared.done) return;
  if (request.method !== "POST") return sendJson(response, { error: "Method not allowed" }, 405);
  if (!isAllowedOrigin(requestOrigin(request))) return sendJson(response, { error: "Origin not allowed" }, 403);
  const payload = bodyObject(request);
  const sessionId = cleanId(payload.sessionId);
  if (!sessionId) return sendJson(response, { error: "Invalid session" }, 400);
  const now = new Date();
  const userAgent = String(request.headers["user-agent"] ?? "");
  let city = String(request.headers["x-vercel-ip-city"] ?? "");
  try { city = decodeURIComponent(city); } catch { city = ""; }
  await put(`visits/${now.toISOString().slice(0, 10)}/${sessionId}.json`, JSON.stringify({
    sessionId, visitedAt: now.toISOString(), page: cleanText(payload.page, 180), referrer: cleanText(payload.referrer, 180),
    device: deviceType(userAgent), country: cleanText(request.headers["x-vercel-ip-country"], 8), city: cleanText(city, 80),
    privacy: "No raw IP address stored",
  }), { access: "private", contentType: "application/json", allowOverwrite: true, cacheControlMaxAge: 0 });
  return sendJson(response, { ok: true });
}
