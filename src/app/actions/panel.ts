"use server";
import { revalidatePath } from "next/cache";
import { currentUser, isEmail, saveUser } from "@/lib/auth";
import type { FormState } from "./public";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveCompany(_: FormState, f: FormData): Promise<FormState> {
  const u = await currentUser();
  if (!u) return { error: "Su sesión expiró. Ingrese de nuevo." };
  const c = {
    legalName: str(f, "legalName", 150),
    nit: str(f, "nit", 20),
    address: str(f, "address", 200),
    city: str(f, "city", 80),
    phone: str(f, "phone", 40),
    email: str(f, "email", 160).toLowerCase(),
    storeUrl: str(f, "storeUrl", 200),
  };
  if (c.legalName.length < 3) return { error: "Escriba la razón social o el nombre del comerciante." };
  if (!/^\d{3}\.?\d{3}\.?\d{3,4}(-?\d)?$/.test(c.nit.replace(/\s/g, ""))) return { error: "Escriba un NIT válido. Ejemplo: 901.234.567-8" };
  if (c.address.length < 5) return { error: "Escriba la dirección de notificación." };
  if (c.city.length < 3) return { error: "Escriba la ciudad." };
  if (c.phone.replace(/\D/g, "").length < 7) return { error: "Escriba un teléfono válido." };
  if (!isEmail(c.email)) return { error: "Escriba un correo de contacto válido." };
  u.company = c;
  await saveUser(u);
  revalidatePath("/panel/plantillas");
  return { ok: true, message: "Datos de la empresa guardados. Las plantillas ya se generan con esta información." };
}
