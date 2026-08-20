import { list } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAdmin, prepare, readPrivateJson, sendJson } from "./_shared.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const prepared = prepare(request, response);
  if (prepared.done) return;
  if (request.method !== "GET") return sendJson(response, { error: "Method not allowed" }, 405);
  if (!(await isAdmin(request))) return sendJson(response, { error: "Unauthorized" }, 401);
  const [visitResult, submissionResult] = await Promise.all([list({ prefix: "visits/", limit: 1000 }), list({ prefix: "submissions/", limit: 250 })]);
  const visitsByDay = new Map<string, number>();
  const devices = new Set<string>();
  for (const blob of visitResult.blobs) {
    const parts = blob.pathname.split("/"); const day = parts[1] ?? "unknown"; const device = (parts[2] ?? "").replace(/\.json$/, "");
    visitsByDay.set(day, (visitsByDay.get(day) ?? 0) + 1); if (device) devices.add(device);
  }
  const recentMeta = submissionResult.blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(0, 100);
  const submissions = (await Promise.all(recentMeta.map(async (blob) => {
    const data = await readPrivateJson(blob.pathname).catch(() => null) as Record<string, unknown> | null;
    return data ? { ...data, metadataPath: blob.pathname } : null;
  }))).filter(Boolean);
  return sendJson(response, {
    totalVisitDays: visitResult.blobs.length, uniqueDevices: devices.size, photoCount: submissionResult.blobs.length,
    visitsByDay: Array.from(visitsByDay.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-30), submissions,
    capped: visitResult.hasMore || submissionResult.hasMore,
  });
}
