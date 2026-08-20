import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bodyObject, cleanId, cleanText, deviceType, isAllowedOrigin, prepare, requestOrigin, sendJson } from "./_shared.js";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const prepared = prepare(request, response);
  if (prepared.done) return;
  if (request.method !== "POST") return sendJson(response, { error: "Method not allowed" }, 405);
  if (!isAllowedOrigin(requestOrigin(request))) return sendJson(response, { error: "Origin not allowed" }, 403);
  const payload = bodyObject(request);
  const sessionId = cleanId(payload.sessionId);
  if (payload.consent !== true) return sendJson(response, { error: "Explicit consent is required" }, 400);
  const mimeType = cleanText(payload.mimeType, 40);
  const photoBase64 = String(payload.photoBase64 ?? "");
  if (!sessionId || !acceptedTypes.has(mimeType) || !photoBase64) return sendJson(response, { error: "Missing or invalid photo" }, 400);
  if (photoBase64.length > 1_500_000) return sendJson(response, { error: "Compressed photo is too large" }, 413);
  const bytes = Buffer.from(photoBase64, "base64");
  if (!bytes.length || bytes.length > 1_100_000) return sendJson(response, { error: "Invalid photo size" }, 413);

  const now = new Date();
  const submissionId = crypto.randomUUID();
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const image = await put(`photos/${now.toISOString().slice(0, 7)}/${submissionId}.${extension}`, bytes, {
    access: "private", addRandomSuffix: true, contentType: mimeType, cacheControlMaxAge: 0,
  });
  const metadata = {
    submissionId, sessionId, photoPath: image.pathname, submittedAt: now.toISOString(), consentVersion: "photo-admin-view-v1",
    consentText: "Player voluntarily allowed the site owner to view this uploaded photo.", nickname: cleanText(payload.nickname, 24),
    modelSummary: cleanText(payload.modelSummary, 240), height: cleanText(payload.height, 8), music: cleanText(payload.music, 120),
    drink: cleanText(payload.drink, 120), device: deviceType(String(request.headers["user-agent"] ?? "")),
    country: cleanText(request.headers["x-vercel-ip-country"], 8),
  };
  const meta = await put(`submissions/${now.toISOString().slice(0, 7)}/${submissionId}.json`, JSON.stringify(metadata), {
    access: "private", contentType: "application/json", cacheControlMaxAge: 0,
  });
  return sendJson(response, { ok: true, submissionId, metadataPath: meta.pathname });
}
