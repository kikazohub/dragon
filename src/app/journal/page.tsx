import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { syncTimeline, getTimeline } from "@/lib/dragon";
import { stageForDay } from "@/lib/options";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (!dragon) redirect("/configure");

  syncTimeline(dragon);
  const events = getTimeline(dragon.id);

  return (
    <div className="animate-fade-up mx-auto flex max-w-2xl flex-col gap-6 py-2">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Diario de {dragon.name}</h1>
        <p className="mt-2 text-zinc-400">
          Cada día de su vida queda grabado aquí. Cuando no mires, tu dragón sigue creciendo.
        </p>
      </div>

      {events.length === 0 && (
        <Card className="text-center text-zinc-400">
          Todavía no hay entradas. Vuelve mañana: este diario se escribe solo.
        </Card>
      )}

      <div className="relative flex flex-col gap-4 before:absolute before:left-5 before:top-2 before:h-full before:w-px before:bg-white/10">
        {events.map((ev, i) => {
          const stage = stageForDay(ev.day);
          return (
            <div key={i} className="relative flex gap-4 pl-12">
              <div className="absolute left-0 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#140f20] text-base">
                {stage.emoji}
              </div>
              <Card className="min-w-0 flex-1 p-4!">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold">{ev.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-500">Día {ev.day}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-300 [overflow-wrap:anywhere]">{ev.content}</p>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}