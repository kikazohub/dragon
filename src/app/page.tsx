import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getUserById, getDragonByUser } from "@/lib/data";
import { syncTimeline, getStats, dayOf } from "@/lib/dragon";
import { stageForDay, EGG_COLORS, ELEMENTS, nextStageOf } from "@/lib/options";
import { Egg } from "@/components/Egg";
import { DragonVisual } from "@/components/DragonVisual";
import { Card, StageBar, StatChip, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  const user = session ? getUserById(session.userId) : null;
  const dragon = user ? getDragonByUser(user.id) : null;

  if (!dragon) {
    return (
      <div className="animate-fade-up mx-auto flex max-w-3xl flex-col items-center gap-8 py-14 text-center">
        <Egg shell="#f2e3cf" spots="#e8c9a6" glow="#ffb06a" day={0} />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Cria a tu <span className="text-amber-400">dragón imaginario</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Un huevo aparecerá hoy. En tres días eclosionará. Con el paso de los días crecerá, se volverá
            más fuerte y aprenderá a conocerte: su personalidad, su forma y sus recuerdos se forjan juntos.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link href="/configure">
              <Button>Poner mi huevo 🥚</Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button>Crear mi cuenta</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-white/10 text-white hover:bg-white/20">Ya tengo cuenta</Button>
              </Link>
            </>
          )}
        </div>
        <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
          {["Día 3 — eclosiona", "Día 7 — primer vuelo", "Día 45 — forma final"].map((t) => (
            <Card key={t} className="px-4 py-3 text-sm text-zinc-300">
              {t}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const day = dayOf(dragon);
  const stage = stageForDay(day);
  const stats = getStats(dragon);
  const eggDef = EGG_COLORS.find((e) => e.id === dragon.eggColor) ?? EGG_COLORS[0];
  const elementDef = ELEMENTS.find((e) => e.id === dragon.element) ?? ELEMENTS[0];
  const physical = JSON.parse(dragon.physical || "{}");
  const next = nextStageOf(day);
  syncTimeline(dragon);

  return (
    <div className="animate-fade-up flex flex-col gap-8">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-zinc-500">
              Día {day} {next ? `· faltan ${next.minDay - day} para ${next.name.toLowerCase()}` : "· forma final"}
            </p>
            <h1 className="mt-1 text-4xl font-extrabold">
              {dragon.name}
              <span title={elementDef.name}> {elementDef.emoji}</span>
            </h1>
            <p className="mt-2 text-zinc-400">
              Tu dragón {stage.name.toLowerCase()} de elemento {elementDef.name.toLowerCase()}.
            </p>
          </div>
          <Card>
            <StageBar stage={stage} pct={stats.progress.pct} toNext={stats.progress.toNext} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatChip label="Nivel" value={stats.level} accent="text-amber-300" />
              <StatChip label="Fuerza" value={stats.strength} accent="text-orange-300" />
              <StatChip label="Vínculo" value={stats.bond} accent="text-emerald-300" />
            </div>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat">
              <Button className="bg-emerald-500 hover:bg-emerald-400">
                {stage.id === "egg" ? "Hablar con el huevo" : "Hablar con el dragón"}
              </Button>
            </Link>
            <Link href="/grow">
              <Button className="bg-white/10 text-white hover:bg-white/20">Cuidar hoy</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center py-6">
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
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dragon", icon: "🐉", title: "Mi dragón", desc: "Perfil, forma y evolución" },
          { href: "/grow", icon: "🍖", title: "Cuidar", desc: "Alimentar, jugar, entrenar" },
          { href: "/journal", icon: "📜", title: "Diario", desc: "Lo que vivió cada día" },
          { href: "/settings", icon: "⚙️", title: "Ajustes", desc: "Personalidad y apariencia" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group">
            <Card className="h-full transition group-hover:bg-white/10">
              <div className="text-2xl">{c.icon}</div>
              <div className="mt-2 font-semibold">{c.title}</div>
              <div className="text-sm text-zinc-400">{c.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}