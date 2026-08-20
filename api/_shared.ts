import { get } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const allowedOrigins = new Set([
  "https://tangzhexuan378-code.github.io",
  "https://afterdark-night-game.vercel.app",
  "http://localhost:3000",
  "http://localhost:4173",
]);

export function requestOrigin(request: VercelRequest) {
  const value = request.headers.origin;
  return Array.isArray(value) ? value[0] : value ?? "";
}

export function isAllowedOrigin(origin: string) {
  return !origin || allowedOrigins.has(origin) || /^https:\/\/afterdark-night-game-[a-z0-9-]+\.vercel\.app$/.test(origin);
}

export function setCors(response: VercelResponse, origin: string) {
  response.setHeader("Access-Control-Allow-Origin", origin && isAllowedOrigin(origin) ? origin : "https://tangzhexuan378-code.github.io");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  response.setHeader("Access-Control-Max-Age", "86400");
  response.setHeader("Vary", "Origin");
  response.setHeader("Cache-Control", "no-store");
}

export function prepare(request: VercelRequest, response: VercelResponse) {
  const origin = requestOrigin(request);
  setCors(response, origin);
  if (request.method === "OPTIONS") { response.status(204).end(); return { origin, done: true }; }
  return { origin, done: false };
}

export function sendJson(response: VercelResponse, data: unknown, status = 200) {
  return response.status(status).json(data);
}

export function cleanText(value: unknown, max = 120) {
  return String(value ?? "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max);
}

export function cleanId(value: unknown) {
  const id = String(value ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return id.length >= 16 ? id : "";
}

export function bodyObject(request: VercelRequest) {
  if (typeof request.body === "string") {
    try { return JSON.parse(request.body) as Record<string, unknown>; } catch { return {}; }
  }
  return request.body && typeof request.body === "object" ? request.body as Record<string, unknown> : {};
}

export function deviceType(userAgent: string) {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function isAdmin(request: VercelRequest) {
  const configured = process.env.ADMIN_TOKEN_HASH ?? "";
  const header = request.headers.authorization;
  const raw = Array.isArray(header) ? header[0] : header ?? "";
  const supplied = raw.replace(/^Bearer\s+/i, "");
  if (!configured || !supplied) return false;
  const actual = await sha256(supplied);
  if (actual.length !== configured.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ configured.charCodeAt(index);
  return difference === 0;
}

export async function readPrivateJson(pathname: string) {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return new Response(result.stream).json();
}
