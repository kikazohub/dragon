import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDragonByUser, getUserById, getMemoriesCount } from "@/lib/data";
import { getStats, syncTimeline, dayOf } from "@/lib/dragon";
import { stageForDay, EGG_COLORS, ELEMENTS, PERSONALITIES, HORN_STYLES, WING_STYLES } from "@/lib/options";
import { Egg } from "@/components/Egg";
import { DragonVisual } from "@/components/DragonVisual";
import { Card, StageBar, StatChip, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DragonPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (!dragon) redirect("/configure");

  const user = getUserById(session.userId);
  const day = dayOf(dragon);
  const stage = stageForDay(day);
  const stats = getStats(dragon);
  syncTimeline(dragon);
  const memories = getMemoriesCount(dragon.id);
  const physical = JSON.parse(dragon.physical || "{}");
  const eggDef = EGG_COLORS.find((e) => e.id === dragon.eggColor) ?? EGG_COLORS[0];
  const elementDef = ELEMENTS.find((e) => e.id === dragon.element) ?? ELEMENTS[0];
  const personality = PERSONALITIES.find((p) => p.id === dragon.personality) ?? PERSONALITIES[0];
  const horn = HORN_STYLES.find((h) => h.id === physical.hornStyle) ?? HORN_STYLES[0];
  const wing = WING_STYLES.find((w) => w.id === physical.wingStyle) ?? WING_STYLES[0];

  return (
    <div className="animate-fade-up flex flex-col gap-6 py-2">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-300">
              ← Inicio
            </Link>
            <span>·</span>
            <span>Perfil</span>
          </div>
          <h1 className="text-4xl font-extrabold">
            {dragon.name}
            <span className="ml-2 text-2xl">{elementDef.emoji}</span>
          </h1>
          <p className="text-zinc-400">
            {stage.emoji} Etapa <strong>{stage.name}</strong> · día {day} de vida ·{" "}
            <span style={{ color: elementDef.color }}>{elementDef.name}</span>
          </p>
          <Card>
            <StageBar stage={stage} pct={stats.progress.pct} toNext={stats.progress.toNext} />
            <div className="mt-5 grid grid-cols-4 gap-3">
              <StatChip label="Nivel" value={stats.level} accent="text-amber-300" />
              <StatChip label="XP" value={dragon.xp} accent="text-yellow-200" />
              <StatChip label="Fuerza" value={stats.strength} accent="text-orange-300" />
              <StatChip label="Sabiduría" value={stats.wisdom} accent="text-indigo-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatChip label="Vínculo" value={stats.bond} accent="text-emerald-300" />
              <StatChip label="Memorias" value={memories} accent="text-sky-300" />
            </div>
          </Card>
          <div className="flex gap-3">
            <Link href="/grow">
              <Button>Cuidar hoy</Button>
            </Link>
            <Link href="/settings">
              <Button className="bg-white/10 text-white hover:bg-white/20">Ajustes</Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {stage.id === "egg" ? (
            <Egg
              shell={eggDef.shell}
              spots={eggDef.spots}
              glow={elementDef.color}
              day={day}
              name={dragon.name}
            />
          ) : (
            <DragonVisual
              stage={stage}
              scaleColor={physical.scaleColor ?? eggDef.scale}
              elementColor={elementDef.color}
              glow={elementDef.glow}
              hornStyle={physical.hornStyle}
              wingStyle={physical.wingStyle}
            />
          )}
          <Card className="w-full max-w-sm">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-zinc-500">Personalidad</span>
              <span className="font-medium">{personality.name}</span>
              <span className="text-zinc-500">Huevos</span>
              <span className="font-medium">{eggDef.name}</span>
              <span className="text-zinc-500">Cuernos</span>
              <span className="font-medium">{horn.name}</span>
              <span className="text-zinc-500">Alas</span>
              <span className="font-medium">{wing.name}</span>
              <span className="text-zinc-500">Dueño</span>
              <span className="font-medium">{user?.username ?? "—"}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}