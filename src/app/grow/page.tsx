import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { syncTimeline, getStats } from "@/lib/dragon";
import { stageForDay, nextStageOf } from "@/lib/options";
import { Card, StageBar } from "@/components/ui";
import { CarePanel } from "@/components/CarePanel";

export const dynamic = "force-dynamic";

export default async function GrowPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (!dragon) redirect("/configure");

  const stats = getStats(dragon);
  const stage = stageForDay(stats.day);
  const next = nextStageOf(stats.day);
  syncTimeline(dragon);

  return (
    <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-6 py-2">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Cuidar a {dragon.name}</h1>
        <p className="mt-2 text-zinc-400">
          Cuidarlo cada día lo hace más fuerte y fortalece el vínculo entre ustedes.
          El tiempo es real: huevo → eclosión el día 3 → joven el 7 → adolescente el 21 → adulto el 45.
        </p>
      </div>
      <Card>
        <StageBar stage={stage} pct={stats.progress.pct} toNext={stats.progress.toNext} />
      </Card>
      <Card>
        <CarePanel
          dragonName={dragon.name}
          stage={stage.id}
          day={stats.day}
          caresToday={stats.caresToday}
          careLimits={stats.careLimits}
        />
      </Card>
      {next && (
        <p className="text-center text-sm text-zinc-500">
          Próxima metamorfosis: <strong>{next.name}</strong> en {next.minDay - stats.day} días.
        </p>
      )}
    </div>
  );
}