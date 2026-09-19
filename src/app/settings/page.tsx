import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { syncTimeline } from "@/lib/dragon";
import { Card } from "@/components/ui";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (!dragon) redirect("/configure");

  const physical = JSON.parse(dragon.physical || "{}") as Record<string, string>;
  const day = syncTimeline(dragon).lastDay;
  const stageId = day >= 45 ? "adult" : day >= 21 ? "teen" : day >= 7 ? "young" : day >= 3 ? "baby" : "egg";

  return (
    <div className="animate-fade-up mx-auto flex max-w-2xl flex-col gap-6 py-2">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Ajustes</h1>
        <p className="mt-2 text-zinc-400">
          Cambia cómo se ve y se siente tu dragón. Algunas formas aparecen con el tiempo.
        </p>
      </div>
      <Card>
        <SettingsForm
          name={dragon.name}
          personality={dragon.personality}
          element={dragon.element}
          eggColor={dragon.eggColor}
          physical={physical}
          stageId={stageId}
        />
      </Card>
    </div>
  );
}