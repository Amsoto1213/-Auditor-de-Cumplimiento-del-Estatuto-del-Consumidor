import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/admin", "/api", "/pago", "/checkout"] }], sitemap: `${appUrl()}/sitemap.xml` };
}
