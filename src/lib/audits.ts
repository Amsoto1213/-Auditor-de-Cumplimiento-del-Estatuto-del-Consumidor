import "server-only";
import { getDoc, newId, putDoc } from "./db";
import type { AuditResult } from "./audit/types";
import type { User } from "./auth";

export interface StoredAudit extends AuditResult {
  id: string;
  userId: string;
  createdAt: string;
}

export async function saveAudit(userId: string, r: AuditResult): Promise<StoredAudit> {
  const a: StoredAudit = { ...r, id: newId("a"), userId, createdAt: new Date().toISOString() };
  await putDoc("audits", a.id, a);
  const idx = (await getDoc<{ ids: string[] }>("user_audits", userId)) ?? { ids: [] };
  idx.ids.unshift(a.id);
  await putDoc("user_audits", userId, idx);
  return a;
}

export async function getAudit(id: string, userId: string): Promise<StoredAudit | null> {
  if (!/^a[a-z0-9]+$/.test(id)) return null;
  const a = await getDoc<StoredAudit>("audits", id);
  if (!a || a.userId !== userId) return null; // control de acceso por propietario
  return a;
}

export async function listAudits(userId: string, limit = 50): Promise<StoredAudit[]> {
  const idx = (await getDoc<{ ids: string[] }>("user_audits", userId)) ?? { ids: [] };
  const docs = await Promise.all(idx.ids.slice(0, limit).map((id) => getDoc<StoredAudit>("audits", id)));
  return docs.filter((d): d is StoredAudit => Boolean(d));
}

export async function auditsThisPeriod(u: User) {
  const all = await listAudits(u.id, 500);
  const since = u.planActivatedAt ? new Date(u.planActivatedAt) : new Date(0);
  return all.filter((a) => new Date(a.createdAt) >= since).length;
}

export function auditLimit(u: User) {
  return u.plan === "pro" ? Infinity : u.plan === "basico" ? 12 : 0;
}
