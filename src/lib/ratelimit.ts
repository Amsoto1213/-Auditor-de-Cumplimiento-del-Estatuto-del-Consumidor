import "server-only";
import { headers } from "next/headers";
import { sha256 } from "./db";

// Límite simple en memoria por instancia (mitigación básica de abuso).
const hits = new Map<string, number[]>();

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "0.0.0.0";
}

export async function rateLimit(bucket: string, max: number, windowMs: number) {
  const ip = await clientIp();
  const k = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(k) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  hits.set(k, arr);
  return true;
}

export async function ipHash() {
  return (await sha256(`${await clientIp()}|${process.env.SESSION_SECRET ?? "dev"}`)).slice(0, 16);
}
