import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";
import { POSTS } from "@/lib/blog";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const pages = ["", "/precios", "/normativa", "/blog", "/aliados", "/pqrs", "/legal/terminos", "/legal/datos", "/legal/aviso-privacidad", "/legal/retracto", "/proyecto"];
  return [...pages.map((p) => ({ url: `${base}${p}` })), ...POSTS.map((p) => ({ url: `${base}/blog/${p.slug}` }))];
}
