"use server";
import { redirect } from "next/navigation";
import {
  consumeToken,
  createSession,
  createToken,
  destroySession,
  findUserByEmail,
  getUser,
  hashPassword,
  isAdminEmail,
  isEmail,
  newUserId,
  normalizeEmail,
  passwordProblem,
  saveUser,
  verifyPassword,
  type User,
} from "@/lib/auth";
import { actionEmail, mailEnabled, sendMail } from "@/lib/mail";
import { ipHash, rateLimit } from "@/lib/ratelimit";
import { appUrl } from "@/lib/site";
import type { FormState } from "./public";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

function safeNext(n: string) {
  return n.startsWith("/") && !n.startsWith("//") ? n : "/panel";
}

async function sendVerification(u: User): Promise<string | undefined> {
  const token = await createToken(u.id, "verify", 48);
  const link = `${appUrl()}/verificar?token=${token}`;
  const sent = await sendMail(u.email, "Confirme su correo · Auditor Legal", actionEmail("Confirme su correo", `Hola ${u.name}, confirme su correo electrónico para activar su cuenta.`, link, "Confirmar correo"));
  return sent ? undefined : link;
}

export async function register(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("register", 8, 60 * 60_000))) return { error: "Demasiados intentos. Intente más tarde." };
  const name = str(f, "name", 100);
  const email = normalizeEmail(str(f, "email", 160));
  const password = String(f.get("password") ?? "");
  const storeUrl = str(f, "storeUrl", 200);
  const terms = f.get("terms") === "on";
  const data = f.get("data") === "on";
  const marketing = f.get("marketing") === "on";
  if (name.length < 2) return { error: "Escriba su nombre completo." };
  if (!isEmail(email)) return { error: "Escriba un correo electrónico válido." };
  const pw = passwordProblem(password);
  if (pw) return { error: pw };
  if (!terms) return { error: "Debe aceptar los términos y condiciones." };
  if (!data) return { error: "Debe autorizar el tratamiento de sus datos personales para crear la cuenta." };
  if (await findUserByEmail(email)) return { error: "Ya existe una cuenta con este correo. Inicie sesión o recupere su contraseña." };

  const now = new Date().toISOString();
  const u: User = {
    id: newUserId(),
    email,
    name,
    passwordHash: await hashPassword(password),
    emailVerified: false,
    plan: "gratis",
    company: storeUrl ? { legalName: "", nit: "", address: "", city: "", phone: "", email, storeUrl } : undefined,
    consent: { terms, data, marketing, at: now, ip: await ipHash() },
    createdAt: now,
    role: isAdminEmail(email) ? "admin" : "user",
  };
  await saveUser(u);
  const demoLink = await sendVerification(u);
  return {
    ok: true,
    message: demoLink
      ? "Cuenta creada. Como la app está en modo demostración (sin servidor de correo), confirme su correo con el siguiente enlace:"
      : `Cuenta creada. Enviamos un enlace de confirmación a ${email}. Revise su bandeja de entrada (y la carpeta de spam).`,
    data: demoLink ? { link: demoLink } : {},
  };
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("login", 10, 15 * 60_000))) return { error: "Demasiados intentos de inicio de sesión. Espere unos minutos." };
  const email = normalizeEmail(str(f, "email", 160));
  const password = String(f.get("password") ?? "");
  const next = safeNext(str(f, "next", 300) || "/panel");
  const u = await findUserByEmail(email);
  if (!u || !(await verifyPassword(password, u.passwordHash))) return { error: "Correo o contraseña incorrectos." };
  if (!u.emailVerified) {
    const demoLink = await sendVerification(u);
    return {
      error: demoLink
        ? "Debe confirmar su correo antes de ingresar. Modo demostración: use este enlace para confirmarlo."
        : "Debe confirmar su correo antes de ingresar. Le enviamos un nuevo enlace de confirmación.",
      data: demoLink ? { link: demoLink } : {},
    };
  }
  await createSession(u.id);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const userId = await consumeToken(token, "verify");
  if (!userId) return false;
  const u = await getUser(userId);
  if (!u) return false;
  u.emailVerified = true;
  await saveUser(u);
  return true;
}

export async function requestReset(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("reset", 5, 60 * 60_000))) return { error: "Demasiados intentos. Intente más tarde." };
  const email = normalizeEmail(str(f, "email", 160));
  if (!isEmail(email)) return { error: "Escriba un correo electrónico válido." };
  const u = await findUserByEmail(email);
  const generic = "Si el correo está registrado, recibirá un enlace para restablecer su contraseña. El enlace vence en 1 hora.";
  if (!u) return { ok: true, message: generic };
  const token = await createToken(u.id, "reset", 1);
  const link = `${appUrl()}/restablecer?token=${token}`;
  const sent = await sendMail(u.email, "Restablezca su contraseña · Auditor Legal", actionEmail("Restablecer contraseña", "Recibimos una solicitud para cambiar su contraseña.", link, "Crear nueva contraseña"));
  if (!sent && !mailEnabled()) return { ok: true, message: "Modo demostración (sin servidor de correo): use este enlace para restablecer la contraseña.", data: { link } };
  return { ok: true, message: generic };
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  const token = str(f, "token", 200);
  const password = String(f.get("password") ?? "");
  const confirm = String(f.get("confirm") ?? "");
  const pw = passwordProblem(password);
  if (pw) return { error: pw };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  const userId = await consumeToken(token, "reset");
  if (!userId) return { error: "El enlace no es válido o ya venció. Solicite uno nuevo." };
  const u = await getUser(userId);
  if (!u) return { error: "Usuario no encontrado." };
  u.passwordHash = await hashPassword(password);
  u.emailVerified = true;
  await saveUser(u);
  return { ok: true, message: "Su contraseña fue actualizada. Ya puede iniciar sesión." };
}
