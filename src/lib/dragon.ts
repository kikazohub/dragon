import { db, dayFromDate } from "./db";
import { stageForDay, STAGES, pick } from "./options";
import type { Stage } from "./options";
import { getMemoriesCount } from "./data";

export interface Dragon {
  id: number;
  userId: number;
  name: string;
  personality: string;
  element: string;
  eggColor: string;
  physical: string;
  stage: string;
  level: number;
  xp: number;
  bond: number;
  lastSyncedDay: number;
  lastSeenAt: string | null;
  createdAt: string;
  hatchedAt: string | null;
}

export interface DayStats {
  feed: number;
  play: number;
  train: number;
  talk: number;
}

export interface Stats {
  level: number;
  xpToNext: number;
  strength: number;
  wisdom: number;
  bond: number;
  day: number;
  stage: Stage;
  progress: { pct: number; toNext: number | null };
  caresToday: DayStats;
  careLimits: Record<string, number>;
}

const XP_GAIN: Record<string, number> = { feed: 6, play: 8, train: 10, talk: 4 };
const BOND_GAIN: Record<string, number> = { feed: 2, play: 3, train: 3, talk: 2 };
const CARE_LIMITS: Record<string, number> = { feed: 1, play: 1, train: 2, talk: 3 };

export function dayOf(dragon: Dragon): number {
  return dayFromDate(dragon.createdAt);
}

export function careCountsToday(dragonId: number, day: number): DayStats {
  const rows = db
    .prepare(
      `SELECT kind, COUNT(*) as n FROM care_log WHERE dragon_id=? AND day=? GROUP BY kind`
    )
    .all(dragonId, day) as { kind: string; n: number }[];
  const counts: DayStats = { feed: 0, play: 0, train: 0, talk: 0 };
  for (const r of rows) {
    if (r.kind in counts) counts[r.kind as keyof DayStats] = r.n;
  }
  return counts;
}

export function careCountsTotal(dragonId: number): Record<string, number> {
  const rows = db
    .prepare(`SELECT kind, COUNT(*) as n FROM care_log WHERE dragon_id=? GROUP BY kind`)
    .all(dragonId) as { kind: string; n: number }[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.kind] = r.n;
  return counts;
}

export function getStats(dragon: Dragon): Stats {
  const day = dayOf(dragon);
  const stage = stageForDay(day);
  const nextIdx = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const next = STAGES[nextIdx] ?? null;
  const progressPct = next
    ? Math.min(
        100,
        Math.round(((day - stage.minDay) / (next.minDay - stage.minDay)) * 100)
      )
    : 100;
  const toNext = next ? next.minDay - day : null;
  const caresToday = careCountsToday(dragon.id, day);
  const totalCares = careCountsTotal(dragon.id);
  const memories = getMemoriesCount(dragon.id);
  return {
    level: 1 + Math.floor(dragon.xp / 60),
    xpToNext: 60 - (dragon.xp % 60),
    strength: 1 + Math.floor(dragon.xp / 30) + (totalCares.train ?? 0),
    wisdom: 1 + Math.floor(dragon.xp / 40) + Math.floor(memories * 1.5),
    bond: dragon.bond,
    day,
    stage,
    progress: { pct: progressPct, toNext },
    caresToday,
    careLimits: CARE_LIMITS,
  };
}

export function canCare(dragon: Dragon, kind: string): boolean {
  const day = dayOf(dragon);
  if (!CARE_LIMITS[kind]) return false;
  const stage = stageForDay(day);
  if (kind === "talk" && stage.id === "egg" && day < 1) return false;
  if ((kind === "feed" || kind === "play" || kind === "train") && stage.id === "egg")
    return false;
  const counts = careCountsToday(dragon.id, day);
  return counts[kind as keyof DayStats] < CARE_LIMITS[kind];
}

export function doCare(dragonId: number, kind: string, dragon: Dragon): boolean {
  const day = dayOf(dragon);
  if (!canCare(dragon, kind)) return false;
  const xpGain = XP_GAIN[kind] ?? 0;
  const bondGain = BOND_GAIN[kind] ?? 0;
  db.prepare(`INSERT INTO care_log (dragon_id, kind, day) VALUES (?,?,?)`).run(
    dragonId,
    kind,
    day
  );
  db.prepare(`UPDATE dragons SET xp = xp + ?, bond = bond + ? WHERE id=?`).run(
    xpGain,
    bondGain,
    dragonId
  );
  return true;
}

// ── Timeline ──

interface TimelineTemplate {
  title: string;
  content: string;
}

const EGG_TITLES = [
  "Latidos bajo la cáscara",
  "El huevo tiembla suavemente",
  "Susurros desde dentro del huevo",
  "La cáscara brilla por un instante",
];

const EGG_CONTENTS = [
  "Algo vivo late dentro de {name}. Sientes una presencia diminuta, curiosa, que intenta contactar contigo a través de la cáscara.",
  "{name} se mueve apenas. Un brillo tenue recorre las vetas del huevo cuando te acercas.",
  "Una pequeña vibración atraviesa la cáscara. Como si {name} estuviera soñando contigo esta noche.",
  "Te acercas al huevo y notas que la temperatura del agua... no, de la habitación ha subido ligeramente. {name} reconoce tu presencia.",
];

const BABY_TITLES = [
  "El huevo eclosiona",
  "Primeras chapuzas de escamas",
  "Los primeros pasos",
  "Un rugido diminuto",
];

const BABY_CONTENTS = [
  "¡{name} ha eclosionado! Sus ojos brillantes te miran por primera vez. Ya puedes hablar con él y contagiarte de su curiosidad.",
  "{name} camina tambaleándose por la mesa. Sus escamas son suaves aún, y su cola no para de moverse cuando te ve.",
  "Hoy {name} intentó escupir fuego. En su lugar salió una pequeña chispa que iluminó su cara sorprendida. Sin duda es muy travieso.",
  "{name} se escondió bajo tu almohada esta noche. Parece que aún necesita sentirte cerca para poder dormir.",
];

const YOUNG_TITLES = [
  "Primeras alas desplegadas",
  "El primer vuelo",
  "Volando bajo",
  "Alas contra el viento",
];

const YOUNG_CONTENTS = [
  "Hoy {name} desplegó sus alas por primera vez. El viento de la ventana parecía invitarlo. Aún no vuela lejos, pero se lanza con valentía.",
  "{name}intentó volar y terminó atravesando la cocina. Pero no se rinde. Cada intento lo acerca más al cielo.",
  "Las alas de {name} ya tienen tamaño. Un vuelo suave,controlado, te muestra que está creciendo más rápido de lo que imaginabas.",
  "Esta tarde {name} se posó en tu hombro y permaneció allí en silencio, mirando el horizonte como si calculara distancia.",
];

const TEEN_TITLES = [
  "Carácter definido",
  "Una vocación inesperada",
  "Las escamas endurecen",
  "Respeto de los demás",
];

const TEEN_CONTENTS = [
  "{name} ha cambiado. Su voz ya no es la del bebé que conociste. Hoy te mira a los ojos y sientes una profundidad nueva en su mirada.",
  "Una tormenta se acercó esta noche. {name} se interpuso entre tú y la ventana, protegiéndote sin decir nada. La lealtad ya es parte de su naturaleza.",
  "{name} colecciona piedras. Dice que cada una tiene una historia. Tal vez tiene razón.",
  "Hoy {name} se peleó con una paloma por una migaja de pan. Perdió. Pero levantó la cabeza con dignidad de dragón.",
];

const ADULT_TITLES = [
  "Dragón adulto",
  "Tu dragón ha llegado",
  "La evolución final",
  "El dragón se revela",
];

const ADULT_CONTENTS = [
  "{name} se yergue ante ti, majestuoso y poderoso. Las escamas resplandecen con su elemento. Ha llegado a la madurez, y tu vínculo ha forjado al dragón que siempre debió ser.",
  "Hoy miras a {name} y ya no ves al huevo, ni al bebé, ni al joven rebelde. Ves a tu dragón, completo, fuerte y sabio. Todo lo que le enseñaste está ahí en sus ojos.",
  "El elemento de {name} estalla hoy con fuerza. Un rugido profundo recorre el cielo. No es una amenaza, es celebración.",
  "Tu historia juntos ha sido larga. {name} se acerca y apoya su cabeza enorme contra tu pecho. Nunca un dragón fue tan gentil con nadie.",
];

function templatesForStage(stageId: string): TimelineTemplate[] {
  const titles: string[] =
    stageId === "egg"
      ? EGG_TITLES
      : stageId === "baby"
        ? BABY_TITLES
        : stageId === "young"
          ? YOUNG_TITLES
          : stageId === "teen"
            ? TEEN_TITLES
            : ADULT_TITLES;
  const contents =
    stageId === "egg"
      ? EGG_CONTENTS
      : stageId === "baby"
        ? BABY_CONTENTS
        : stageId === "young"
          ? YOUNG_CONTENTS
          : stageId === "teen"
            ? TEEN_CONTENTS
            : ADULT_CONTENTS;
  return titles.map((t, i) => ({ title: t, content: contents[i] }));
}

export function syncTimeline(dragon: Dragon): { events: { day: number; title: string; content: string }[]; lastDay: number } {
  const day = dayOf(dragon);
  const newEvents: { day: number; title: string; content: string }[] = [];

  if (dragon.lastSyncedDay < day) {
    const insert = db.prepare(
      `INSERT INTO timeline_events (dragon_id, day, title, content) VALUES (?,?,?,?)`
    );
    for (let d = dragon.lastSyncedDay + 1; d <= day; d++) {
      const stage = stageForDay(d);
      const milestone: Record<number, { title: string; content: string }> = {
        3: { title: "¡Ha eclosionado!", content: "¡{name} rompe la cáscara con sus dientes diminutos! Sus primeros ojos se abren al mundo... y te ven a ti." },
        7: { title: "Primer vuelo", content: "Hoy {name} despliega el ala y se lanza al primer vuelo real. El cielo le pertenece." },
        21: { title: "Adolescencia", content: "{name} ya no es pequeño. Su voz cambia, sus escamas endurecen. El dragón se está revelando." },
        45: { title: "Adultez", content: "Ha llegado. El dragón {name} se yergue majestuoso, en su forma definitiva, unido a ti para siempre." },
      };
      let ev: { title: string; content: string };
      if (milestone[d]) {
        ev = milestone[d];
      } else {
        const pool = templatesForStage(stage.id);
        const seed = dragon.id * 7919 + d * 104729;
        ev = pick(pool, seed);
      }
      const content = ev.content.replace(/{name}/g, dragon.name);
      insert.run(dragon.id, d, ev.title, content);
      newEvents.push({ day: d, title: ev.title, content });
    }
    db.prepare(`UPDATE dragons SET last_synced_day=? WHERE id=?`).run(day, dragon.id);
  }
  return { events: newEvents, lastDay: day };
}

export interface TimelineRow {
  day: number;
  title: string;
  content: string;
  created_at: string;
}

export function getTimeline(dragonId: number): TimelineRow[] {
  return db
    .prepare(`SELECT day, title, content, created_at FROM timeline_events WHERE dragon_id=? ORDER BY day DESC`)
    .all(dragonId) as TimelineRow[];
}