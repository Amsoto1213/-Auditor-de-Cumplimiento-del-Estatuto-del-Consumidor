import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDoc, newId, putDoc, sha256 } from "./db";
import type { PlanId } from "./site";

export interface Company {
  legalName: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  storeUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  plan: PlanId;
  planActivatedAt?: string;
  planExpiresAt?: string;
  company?: Company;
  consent: { terms: boolean; data: boolean; marketing: boolean; at: string; ip: string };
  createdAt: string;
  role: "user" | "admin";
  utm?: Record<string, string>;
}

const COOKIE = "al_session";
const DAY = 24 * 60 * 60;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("SESSION_SECRET no está configurado");
  }
  return new TextEncoder().encode(s ?? "dev-secret-solo-para-desarrollo-local-0123456789");
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 11);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "La contraseña debe combinar letras y números.";
  return null;
}

export function normalizeEmail(e: string) {
  return (e ?? "").trim().toLowerCase();
}

export function isEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 160;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const idx = await getDoc<{ userId: string }>("emails", await sha256(normalizeEmail(email)));
  if (!idx) return null;
  return getDoc<User>("users", idx.userId);
}

export async function getUser(id: string) {
  return getDoc<User>("users", id);
}

export async function saveUser(u: User) {
  await putDoc("users", u.id, u);
  await putDoc("emails", await sha256(u.email), { userId: u.id });
  return u;
}

export function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * DAY,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const u = await getUser(payload.sub);
    if (u && isAdminEmail(u.email)) u.role = "admin";
    return u;
  } catch {
    return null;
  }
}

export async function requireUser(next = "/panel"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  return u;
}

export function hasPaidPlan(u: User | null) {
  if (!u) return false;
  if (u.plan === "gratis") return false;
  if (u.planExpiresAt && new Date(u.planExpiresAt) < new Date()) return false;
  return true;
}

// ─────────── Tokens de verificación y recuperación ───────────
export async function createToken(userId: string, type: "verify" | "reset", hours: number) {
  const raw = newId("t") + newId();
  await putDoc("tokens", await sha256(raw), {
    userId,
    type,
    expiresAt: new Date(Date.now() + hours * 3600_000).toISOString(),
  });
  return raw;
}

export async function consumeToken(raw: string, type: "verify" | "reset"): Promise<string | null> {
  if (!raw || !/^[A-Za-z0-9]+$/.test(raw)) return null;
  const id = await sha256(raw);
  const t = await getDoc<{ userId: string; type: string; expiresAt: string; used?: boolean }>("tokens", id);
  if (!t || t.type !== type || t.used || new Date(t.expiresAt) < new Date()) return null;
  await putDoc("tokens", id, { ...t, used: true });
  return t.userId;
}

export function newUserId() {
  return newId("u");
}
