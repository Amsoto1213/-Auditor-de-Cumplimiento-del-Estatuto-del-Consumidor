import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Almacén de documentos JSON muy simple.
 *
 * - En producción (Vercel) usa Vercel Blob en modo PRIVADO: cada documento es
 *   un archivo JSON que solo el servidor puede leer con su token secreto.
 * - En desarrollo local, sin token, guarda los documentos en la carpeta `.data/`.
 *
 * Colecciones: users, emails, audits, scans, waitlist, payments, pqrs, partners, tokens.
 */

type Json = Record<string, unknown>;

const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DATA_DIR = path.join(process.cwd(), ".data");

function key(collection: string, id: string) {
  if (!/^[a-z_]+$/.test(collection)) throw new Error("Colección inválida");
  if (!/^[A-Za-z0-9_.-]+$/.test(id)) throw new Error("Identificador inválido");
  return `db/${collection}/${id}.json`;
}

async function blob() {
  return await import("@vercel/blob");
}

export async function getDoc<T = Json>(collection: string, id: string): Promise<T | null> {
  const k = key(collection, id);
  if (blobEnabled()) {
    const { get } = await blob();
    try {
      const res = await get(k, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) return null;
      const text = await new Response(res.stream).text();
      return JSON.parse(text) as T;
    } catch (e) {
      if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return null;
      throw e;
    }
  }
  try {
    const text = await fs.readFile(path.join(DATA_DIR, k), "utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function putDoc<T extends object>(collection: string, id: string, data: T): Promise<T> {
  const k = key(collection, id);
  const body = JSON.stringify(data);
  if (blobEnabled()) {
    const { put } = await blob();
    await put(k, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return data;
  }
  const file = path.join(DATA_DIR, k);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
  return data;
}

export async function delDoc(collection: string, id: string): Promise<void> {
  const k = key(collection, id);
  if (blobEnabled()) {
    const { del } = await blob();
    await del(k);
    return;
  }
  await fs.rm(path.join(DATA_DIR, k), { force: true });
}

export async function listIds(collection: string): Promise<string[]> {
  const prefix = `db/${collection}/`;
  if (blobEnabled()) {
    const { list } = await blob();
    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const res = await list({ prefix, cursor, limit: 1000 });
      for (const b of res.blobs) ids.push(b.pathname.slice(prefix.length).replace(/\.json$/, ""));
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
    return ids;
  }
  try {
    const files = await fs.readdir(path.join(DATA_DIR, prefix));
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export async function listDocs<T = Json>(collection: string): Promise<T[]> {
  const ids = await listIds(collection);
  const docs = await Promise.all(ids.map((id) => getDoc<T>(collection, id)));
  return docs.filter((d): d is Awaited<T> => d !== null) as T[];
}

export async function countDocs(collection: string): Promise<number> {
  return (await listIds(collection)).length;
}

export function newId(prefix = "") {
  const rand = crypto.getRandomValues(new Uint8Array(12));
  const hex = Array.from(rand, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}${Date.now().toString(36)}${hex}`;
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function storageMode() {
  return blobEnabled() ? "Vercel Blob (privado)" : "Archivos locales (.data)";
}
