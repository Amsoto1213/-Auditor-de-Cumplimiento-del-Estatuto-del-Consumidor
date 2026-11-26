import { describe, expect, it } from "vitest";
import { PLANS, priceBreakdown } from "@/lib/site";

describe("precios con IVA (HU-11, HU-18)", () => {
  it("subtotal + IVA = total y el IVA es 19 %", () => {
    for (const p of PLANS.filter((x) => x.priceYear > 0)) {
      const b = priceBreakdown(p.priceYear);
      expect(b.subtotal + b.iva).toBe(b.total);
      expect(Math.abs(b.iva - b.subtotal * 0.19)).toBeLessThanOrEqual(1);
    }
  });
  it("hay tres planes: Gratis, Básico y Pro", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["gratis", "basico", "pro"]);
  });
});
