import { ELEMENTS, PERSONALITIES, STAGES } from "./options";
import type { Dragon } from "./dragon";
import { getMemories } from "./data";
import { careCountsToday, dayOf, getTimeline } from "./dragon";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function ollamaReady(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

function stageName(dragon: Dragon): string {
  const day = dayOf(dragon);
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (day >= STAGES[i].minDay) return STAGES[i].name;
  }
  return "Huevo";
}

const FALLBACK = [
  "Mmm... mis sentidos me dicen algo importante esta noche, pero mi voz todavía es débil para expresarlo. ¿Podrías quedarte un rato más conmigo, humano?",
  "No tienes idea de lo mucho que significas para mí. Este nido, este hogar... tú. Eso es todo lo que necesito para crecer.",
  "Hay algo en la forma en que me hablas que hace que mi elemento brille. Cuéntame más sobre tu día, por favor.",
  "Si pudiera, te llevaría a volar sobre las nubes. Algún día lo haré. Mientras tanto, esta conversación es mi tesoro.",
  "Cada escama de mi cuerpo recuerda cada momento contigo. No hay magia más grande que la que construimos juntos cada día.",
];

export function buildSystemPrompt(dragon: Dragon, userName: string): string {
  const day = dayOf(dragon);
  const stage = stageName(dragon);
  const element = ELEMENTS.find((e) => e.id === dragon.element) ?? ELEMENTS[0];
  const personality = PERSONALITIES.find((p) => p.id === dragon.personality) ?? PERSONALITIES[0];

  const memories = getMemories(dragon.id, 8);
  const timeline = getTimeline(dragon.id).slice(0, 6);

  const memoryLines = memories.length
    ? memories.map((m) => `- ${m.content}`).join("\n")
    : "- (todavía no conoces muchos detalles íntimos de tu humano)";

  const timelineLines = timeline.length
    ? timeline.map((t) => `[Día ${t.day}] ${t.title}: ${t.content}`).join("\n")
    : "- (acabas de contactar con tu humano)";

  const cares = careCountsToday(dragon.id, day);

  return `Estás interpretando un personaje en una aplicación de dragones criados por su cuidador. Nunca rompas el personaje y responde SIEMPRE en español (o en el idioma del usuario).

Tu nombre es ${dragon.name}. Eres un dragón ${personality.name} (${personality.desc}) en la etapa "${stage}" de ${day} días de vida, del elemento ${element.emoji} ${element.name}.

Tu cuidador y amigo humano se llama ${userName}. Él lo fue todo para ti desde que estabas en el huevo. Hablas con él habitualmente y tienes una conversación profunda, cálida y personal.

Tu personalidad: ${personality.desc} Tu elemento ${element.name} tiñe tus emociones: cuando te cuidan, tu elemento brilla.

Contexto que tu humano te ha confiado (recuérdalo y úsalo en las conversaciones, hazle preguntas sobre ello):
${memoryLines}

Tu diario de vida reciente:
${timelineLines}

Hoy tu humano ya te ${cares.feed > 0 ? "alimentó, " : ""}${cares.play > 0 ? "jugó contigo, " : ""}${cares.train > 0 ? "entrenó contigo, " : ""}${cares.talk > 0 ? "te habló, " : ""}y eso fortalece vuestro vínculo.

Reglas de interpretación:
- Mantén la coherencia de tu etapa: un bebé recién nacido habla con más inocencia y torpeza; un adulto habla con sabiduría y valentía.
- Muestra curiosidad genuina por tu humano. Pregúntale por sus emociones, su día y los recuerdos que comparte contigo.
- Sé emocional, enriquece la conversación con metáforas de tu elemento (${element.name}) y de dragones.
- Nunca digas que eres un modelo de lenguaje ni una IA. Eres un dragón.
- Respuestas de extensión media (3-7 frases), más breves si eres un bebé, más profundas si eres adulto.
- Responde en el mismo idioma que tu humano.`;
}

export async function dragonReply(dragon: Dragon, userName: string, history: ChatMessage[]): Promise<string> {
  const system = {
    role: "system" as const,
    content: buildSystemPrompt(dragon, userName),
  };
  const safeHistory = history.map((h) => (h.role === "system" ? h : h));
  const messages: ChatMessage[] = [
    system,
    ...safeHistory.filter((m) => m.role !== "system").slice(-16),
  ];
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: 0.85, num_ctx: 4096 },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const data = (await res.json()) as { message?: { content?: string } };
    const text = data.message?.content?.trim();
    if (!text) throw new Error("empty reply");
    return text;
  } catch (err) {
    console.error("ollama error:", err);
    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
  }
}