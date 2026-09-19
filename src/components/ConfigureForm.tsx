"use client";

import { useState, useActionState } from "react";
import { createDragonAction } from "@/app/actions";
import { Button, Input, ErrorBox } from "@/components/ui";
import { Egg } from "@/components/Egg";
import { PERSONALITIES, ELEMENTS, EGG_COLORS } from "@/lib/options";

const STEPS = ["Nombre", "Personalidad", "Elemento", "El huevo"];

export function ConfigureForm() {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState(createDragonAction, null);

  const [name, setName] = useState("");
  const [personality, setPersonality] = useState(PERSONALITIES[0].id);
  const [element, setElement] = useState(ELEMENTS[0].id);
  const [eggColor, setEggColor] = useState(EGG_COLORS[0].id);

  const goNext = () => {
    if (step === 0 && name.trim().length < 2) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-amber-400" : "bg-white/10"
              }`}
            />
            <span className={`text-[11px] ${i <= step ? "text-amber-300" : "text-zinc-500"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="personality" value={personality} />
        <input type="hidden" name="element" value={element} />
        <input type="hidden" name="eggColor" value={eggColor} />

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">¿Cómo se llamará tu dragón?</h2>
            <div className="text-zinc-400">Este nombre lo escuchará su dueño por muchas generaciones.</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sombra, Ember, Latte..."
              maxLength={24}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-1 text-2xl font-bold">Elige su personalidad</h2>
            <p className="mb-4 text-zinc-400">Definirá cómo habla, juega y te acompaña tremendo dragón.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersonality(p.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    personality === p.id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="mt-1 text-sm text-zinc-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-1 text-2xl font-bold">¿Qué elemento lo habita?</h2>
            <p className="mb-4 text-zinc-400">Su fuego interior, su hielo... su esencia.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ELEMENTS.map((el) => (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => setElement(el.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    element === el.id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-2xl">{el.emoji}</span> {el.name}
                  </div>
                  <div
                    className="mt-2 h-1.5 w-24 rounded-full"
                    style={{ background: el.color }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-1 text-2xl font-bold">El huevo que lo guarda</h2>
            <p className="mb-6 text-zinc-400">En 3 días eclosionará. El color marcará sus escamas.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-3">
                {EGG_COLORS.map((ec) => (
                  <button
                    key={ec.id}
                    type="button"
                    onClick={() => setEggColor(ec.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      eggColor === ec.id
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Egg shell={ec.shell} spots={ec.spots} glow={ec.shell} day={0} />
                    <span className="text-sm font-medium">{ec.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4">
                <Egg
                  shell={EGG_COLORS.find((e) => e.id === eggColor)!.shell}
                  spots={EGG_COLORS.find((e) => e.id === eggColor)!.spots}
                  glow={ELEMENTS.find((e) => e.id === element)!.color}
                  day={0}
                  name={name || "Tu futuro dragón"}
                />
              </div>
            </div>
          </div>
        )}

        <ErrorBox>{state?.error}</ErrorBox>

        <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" className="bg-white/10 text-white hover:bg-white/20" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} disabled={step === 0 && name.trim().length < 2}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Poniendo el huevo..." : "Poner el huevo 🥚"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}