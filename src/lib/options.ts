export interface EggColor {
  id: string;
  name: string;
  shell: string;
  scale: string;
  spots: string;
}

export const EGG_COLORS: EggColor[] = [
  { id: "suave", name: "Cáscara suave", shell: "#f2e3cf", scale: "#d9a066", spots: "#e8c9a6" },
  { id: "esmeralda", name: "Esmeralda", shell: "#b8eccd", scale: "#2e9e6b", spots: "#dff7e8" },
  { id: "medianoche", name: "Medianoche", shell: "#5f6fb2", scale: "#3a4a8f", spots: "#8ba0e0" },
  { id: "crimson", name: "Crimson", shell: "#f0a3a0", scale: "#c73e37", spots: "#f7cdca" },
  { id: "cielo", name: "Cielo", shell: "#b8dcff", scale: "#3b82c4", spots: "#dceeff" },
];

export const ELEMENTS = [
  { id: "fuego", name: "Fuego", emoji: "🔥", color: "#ff6b35", glow: "#ffa94d" },
  { id: "hielo", name: "Hielo", emoji: "❄️", color: "#5ec8ff", glow: "#a8e4ff" },
  { id: "trueno", name: "Trueno", emoji: "⚡", color: "#ffd93b", glow: "#fff3a8" },
  { id: "bosque", name: "Bosque", emoji: "🌿", color: "#58d68d", glow: "#b6f0cd" },
];

export const PERSONALITIES = [
  { id: "valiente", name: "Valiente", desc: "Protector y audaz, nunca retrocede ante el peligro." },
  { id: "leal", name: "Leal", desc: "Su vínculo contigo es inquebrantable, siempre a tu lado." },
  { id: "curioso", name: "Curioso", desc: "Pregunta y explora todo lo que le rodea sin descanso." },
  { id: "bromista", name: "Bromista", desc: "Vive el juego, las travesuras y la risa con intensidad." },
  { id: "sabio", name: "Sabio", desc: "Habla con calma, observa el mundo y guarda antiguas lecciones." },
  { id: "soñador", name: "Soñador", desc: "Siempre mirando las estrellas, imaginando mundos lejanos." },
];

export const HORN_STYLES = [
  { id: "nudos", name: "Nudos", desc: "Pequeños bultos de cuerno que asoman" },
  { id: "rectos", name: "Rectos", desc: "Cuernos que apuntan orgullosos al cielo" },
  { id: "curvos", name: "Curvos", desc: "Cuernos arqueados con elegancia hacia atrás" },
  { id: "ramificados", name: "Ramificados", desc: "Cuernos ramificados, como de un dragón antiguo" },
];

export const WING_STYLES = [
  { id: "ningunas", name: "Sin alas", desc: "Todavía no necesita volar" },
  { id: "coraceas", name: "Coráceas", desc: "Alas de pellejo resistente" },
  { id: "emplumadas", name: "Emplumadas", desc: "Alas de pluma, elegantes al vuelo" },
  { id: "cristal", name: "Cristalinas", desc: "Alas translúcidas que reflejan su elemento" },
];

export interface Stage {
  id: string;
  name: string;
  minDay: number;
  emoji: string;
}

export const STAGES: Stage[] = [
  { id: "egg", name: "Huevo", minDay: 0, emoji: "🥚" },
  { id: "baby", name: "Bebé", minDay: 3, emoji: "🐲" },
  { id: "young", name: "Joven", minDay: 7, emoji: "🐉" },
  { id: "teen", name: "Adolescente", minDay: 21, emoji: "🐉" },
  { id: "adult", name: "Dragón adulto", minDay: 45, emoji: "🐲" },
];

export function stageForDay(day: number): Stage {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (day >= s.minDay) current = s;
    else break;
  }
  return current;
}

export function nextStageOf(day: number): Stage | null {
  const idx = STAGES.findIndex((s) => s.id === stageForDay(day).id);
  return STAGES[idx + 1] ?? null;
}

export function stageProgress(day: number): { pct: number; toNext: number | null } {
  const current = stageForDay(day);
  const next = nextStageOf(day);
  if (!next) return { pct: 100, toNext: null };
  const total = next.minDay - current.minDay;
  const passed = day - current.minDay;
  return { pct: Math.min(100, Math.round((passed / total) * 100)), toNext: next.minDay - day };
}

export function defaultPhysical(eggId: string): Record<string, string> {
  const egg = EGG_COLORS.find((e) => e.id === eggId) ?? EGG_COLORS[0];
  return {
    eggColor: egg.id,
    scaleColor: egg.scale,
    hornStyle: "nudos",
    wingStyle: "ningunas",
  };
}

export function pick<T>(arr: T[], seed: number): T {
  const x = Math.abs(Math.sin(seed) * 10000);
  return arr[Math.floor((x - Math.floor(x)) * arr.length)];
}