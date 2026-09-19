"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  verifyPassword,
} from "../lib/auth";
import {
  createUser,
  getUserByUsername,
  createDragon,
  updateDragonProfile,
  getDragonByUser,
  addMemory,
  addMessage,
} from "../lib/data";
import { doCare } from "../lib/dragon";
import { defaultPhysical } from "../lib/options";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const USERNAME_RE = /^[\p{L}\p{N}_\- ]{2,24}$/u;

export async function signupAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: "Elige un nombre de usuario de 2 a 24 caracteres (letras, números, espacio, _ o -)." };
  }
  if (password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirm) return { ok: false, error: "Las contraseñas no coinciden." };
  if (getUserByUsername(username)) return { ok: false, error: "Ese nombre de usuario ya está en uso." };

  const id = createUser(username, hashPassword(password));
  await createSession(id);
  redirect("/configure");
}

export async function loginAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }
  await createSession(user.id);
  const dragon = getDragonByUser(user.id);
  redirect(dragon ? "/" : "/configure");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function createDragonAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión inválida." };
  const name = String(formData.get("name") ?? "").trim();
  const personality = String(formData.get("personality") ?? "");
  const element = String(formData.get("element") ?? "");
  const eggColor = String(formData.get("eggColor") ?? "");
  const physical = defaultPhysical(eggColor);

  if (name.length < 2) return { ok: false, error: "Tu dragón necesita un nombre." };
  if (getDragonByUser(session.userId)) return { ok: false, error: "Ya tienes un dragón." };

  createDragon(
    session.userId,
    name,
    personality,
    element,
    eggColor,
    JSON.stringify(physical)
  );
  redirect("/");
}

export async function updateProfileAction(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión inválida." };
  const dragon = getDragonByUser(session.userId);
  if (!dragon) return { ok: false, error: "No tienes dragón." };

  const physical = {
    eggColor: String(formData.get("eggColor") ?? dragon.eggColor),
    scaleColor: String(formData.get("scaleColor") ?? ""),
    hornStyle: String(formData.get("hornStyle") ?? ""),
    wingStyle: String(formData.get("wingStyle") ?? ""),
  };
  const base = defaultPhysical(physical.eggColor);
  physical.scaleColor = physical.scaleColor || base.scaleColor;
  physical.hornStyle = physical.hornStyle || base.hornStyle;
  physical.wingStyle = physical.wingStyle || base.wingStyle;

  updateDragonProfile(
    dragon.id,
    String(formData.get("name") ?? dragon.name).trim() || dragon.name,
    String(formData.get("personality") ?? dragon.personality),
    String(formData.get("element") ?? dragon.element),
    JSON.stringify(physical)
  );
  revalidatePath("/");
  revalidatePath("/dragon");
  revalidatePath("/settings");
  return { ok: true };
}

export interface CareActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  xpGain?: number;
  bondGain?: number;
}

const CARE_LABELS: Record<string, { done: string; undone: string }> = {
  feed: { done: "Ya le has dado de comer hoy. Volverá mañana.", undone: "disfrutó su alimento." },
  play: { done: "Ya jugaste con él hoy. Mañana más.", undone: "jugaron juntos hasta cansarse." },
  train: { done: "El entrenamiento de hoy ya terminó.", undone: "entrenó con fuerza y descubrió algo nuevo." },
  talk: { done: "Ya le hablaste hoy... aunque una charla más nunca viene mal.", undone: "el huevo te respondió con un latido suave." },
};

const XP_GAIN: Record<string, number> = { feed: 6, play: 8, train: 10, talk: 4 };
const BOND_GAIN: Record<string, number> = { feed: 2, play: 3, train: 3, talk: 2 };

export async function careAction(kind: string): Promise<CareActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión inválida." };
  const dragon = getDragonByUser(session.userId);
  if (!dragon) return { ok: false, error: "No tienes dragón." };
  if (!(kind in CARE_LABELS)) return { ok: false, error: "Acción desconocida." };

  if (!doCare(dragon.id, kind, dragon)) {
    return { ok: false, error: CARE_LABELS[kind].done, message: CARE_LABELS[kind].done };
  }
  revalidatePath("/");
  revalidatePath("/grow");
  revalidatePath("/dragon");
  return {
    ok: true,
    xpGain: XP_GAIN[kind],
    bondGain: BOND_GAIN[kind],
    message: `${dragon.name} ${CARE_LABELS[kind].undone}`,
  };
}

export interface MemoryActionResult {
  ok: boolean;
  error?: string;
}

export async function saveMemoryAction(formData: FormData): Promise<MemoryActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión inválida." };
  const dragon = getDragonByUser(session.userId);
  if (!dragon) return { ok: false, error: "No tienes dragón." };
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 3 || content.length > 500) {
    return { ok: false, error: "Escribe un recuerdo o detalle (de 3 a 500 caracteres)." };
  }
  addMemory(dragon.id, content);
  revalidatePath("/chat");
  revalidatePath("/dragon");
  return { ok: true };
}

export interface ChatActionResult {
  ok: boolean;
  error?: string;
  reply?: string;
}

export async function chatAction(content: string): Promise<ChatActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión inválida." };
  const dragon = getDragonByUser(session.userId);
  if (!dragon) return { ok: false, error: "No tienes dragón." };
  const text = content.trim();
  if (!text || text.length > 1000) return { ok: false, error: "Mensaje vacío." };

  const user = await import("../lib/data").then((m) => m.getUserById(session.userId));
  addMessage(dragon.id, "user", text);

  const { getMessages } = await import("../lib/data");
  const history = getMessages(dragon.id, 16).reverse();
  const historyMessages = history.map((m) => ({
    role: m.role === "dragon" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const { dragonReply } = await import("../lib/ollama");
  const reply = await dragonReply(dragon, user?.username ?? "su humano", [
    ...historyMessages,
    { role: "user", content: text },
  ]);
  addMessage(dragon.id, "dragon", reply);
  revalidatePath("/chat");
  return { ok: true, reply };
}