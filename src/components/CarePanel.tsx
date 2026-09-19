"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { careAction } from "@/app/actions";
import type { CareActionResult } from "@/app/actions";
import { ErrorBox } from "@/components/ui";

const CARE_DEFS = [
  { kind: "feed", label: "Alimentar", emoji: "🍖", desc: "+XP y crece más fuerte", stage: "hatched" },
  { kind: "play", label: "Jugar", emoji: "🎯", desc: "Aumenta el vínculo y el ánimo", stage: "hatched" },
  { kind: "train", label: "Entrenar", emoji: "⚔️", desc: "Fuerza y disciplina", stage: "child" },
  { kind: "talk", label: "Hablarle", emoji: "💬", desc: "Su espíritu escucha, incluso en el huevo", stage: "always" },
] as const;

interface Props {
  dragonName: string;
  stage: string;
  day: number;
  caresToday: { feed: number; play: number; train: number; talk: number };
  careLimits: Record<string, number>;
}

export function CarePanel({ dragonName, stage, day, caresToday, careLimits }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<CareActionResult | null>(null);
  const router = useRouter();

  const run = (kind: string) => {
    startTransition(async () => {
      const res = await careAction(kind);
      setFeedback(res);
      router.refresh();
    });
  };

  const canTrain = ["young", "teen", "adult"].includes(stage);

  const items = CARE_DEFS.filter((c) => {
    if (c.stage === "hatched" && stage === "egg") return false;
    if (c.kind === "train" && !canTrain) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {feedback && !feedback.ok && <ErrorBox>{feedback.error}</ErrorBox>}
      {feedback?.ok && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {feedback.message} {feedback.xpGain ? `(+${feedback.xpGain} XP, +${feedback.bondGain} vínculo)` : ""}
        </div>
      )}
      {stage === "egg" && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          {day < 1
            ? "El huevo está dormido. Volverá mañana cuando despierte su espíritu."
            : "El huevo tiembla y te busca. Háblale para que sepa que ya tienes nombre y propósito."}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => {
          const used = caresToday[c.kind] ?? 0;
          const limit = careLimits[c.kind] ?? 0;
          const remaining = Math.max(0, limit - used);
          return (
            <button
              key={c.kind}
              onClick={() => run(c.kind)}
              disabled={pending || remaining === 0}
              className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span>
                <span className="block font-semibold">{c.label}</span>
                <span className="block text-sm text-zinc-400">{c.desc}</span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {remaining > 0 ? `Hoy quedan ${remaining}` : "Hecho por hoy ✓"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {!canTrain && stage !== "egg" && (
        <p className="text-xs text-zinc-500">
          Entrenar se desbloquea con la etapa de Joven (día 7).
        </p>
      )}
      <p className="text-xs text-zinc-500">
        {dragonName} crece contigo cada día. El tiempo pasa aunque no hagas nada: eclosionará, volará y se
        volverá majestuoso con los días reales.
      </p>
    </div>
  );
}