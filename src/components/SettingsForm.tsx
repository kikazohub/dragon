"use client";

import { useState, useActionState } from "react";
import { updateProfileAction } from "@/app/actions";
import { Button, Input, Label, ErrorBox } from "@/components/ui";
import { PERSONALITIES, ELEMENTS, EGG_COLORS, HORN_STYLES, WING_STYLES } from "@/lib/options";

interface Props {
  name: string;
  personality: string;
  element: string;
  eggColor: string;
  physical: Record<string, string>;
  stageId: string;
}

export function SettingsForm({ name, personality, element, eggColor, physical, stageId }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  const [fName, setFName] = useState(name);
  const [fPersonality, setFPersonality] = useState(personality);
  const [fElement, setFElement] = useState(element);
  const [fEgg, setFEgg] = useState(eggColor);
  const [fScale, setFScale] = useState(physical.scaleColor ?? EGG_COLORS[0].scale);
  const [fHorn, setFHorn] = useState(physical.hornStyle ?? "nudos");
  const [fWing, setFWing] = useState(physical.wingStyle ?? "ningunas");

  const canWings = ["young", "teen", "adult"].includes(stageId);
  const egg = EGG_COLORS.find((e) => e.id === fEgg) ?? EGG_COLORS[0];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="name" value={fName} />
      <input type="hidden" name="personality" value={fPersonality} />
      <input type="hidden" name="element" value={fElement} />
      <input type="hidden" name="eggColor" value={fEgg} />
      <input type="hidden" name="scaleColor" value={fScale} />
      <input type="hidden" name="hornStyle" value={fHorn} />
      <input type="hidden" name="wingStyle" value={canWings ? fWing : "ningunas"} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Nombre del dragón</Label>
          <Input value={fName} onChange={(e) => setFName(e.target.value)} maxLength={24} />
        </div>
        <div>
          <Label>Personalidad</Label>
          <select
            value={fPersonality}
            onChange={(e) => setFPersonality(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-amber-400/60"
          >
            {PERSONALITIES.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label>Elemento</Label>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => (
            <button
              type="button"
              key={el.id}
              onClick={() => setFElement(el.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                fElement === el.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              {el.emoji} {el.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label>Color del huevo</Label>
        <select
          value={fEgg}
          onChange={(e) => {
            setFEgg(e.target.value);
            const sel = EGG_COLORS.find((c) => c.id === e.target.value);
            if (sel) setFScale(sel.scale);
          }}
          className="w-full max-w-xs rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-amber-400/60"
        >
          {EGG_COLORS.map((c) => (
            <option key={c.id} value={c.id} className="bg-zinc-900">
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Tu huevo:</span>
          <span className="h-4 w-4 rounded-full border border-white/20" style={{ background: egg.shell }} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label>Color de escamas</Label>
        <div className="flex flex-wrap gap-2">
          {EGG_COLORS.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setFScale(c.scale)}
              className={`h-10 w-10 rounded-full border-2 transition ${
                fScale === c.scale ? "border-amber-400 ring-2 ring-amber-400/30" : "border-white/10"
              }`}
              style={{ background: c.scale }}
              aria-label={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label>Cuernos</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {HORN_STYLES.map((h) => (
            <button
              type="button"
              key={h.id}
              onClick={() => setFHorn(h.id)}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                fHorn === h.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="font-semibold">{h.name}</span>
              <span className="block text-zinc-500">{h.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Label>Alas</Label>
        {canWings ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {WING_STYLES.map((w) => (
              <button
                type="button"
                key={w.id}
                onClick={() => setFWing(w.id)}
                className={`rounded-xl border p-3 text-left text-sm transition ${
                  fWing === w.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="font-semibold">{w.name}</span>
                <span className="block text-zinc-500">{w.desc}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Las alas se desbloquearán cuando {fName || "tu dragón"} alcance la etapa de Joven (día 7).
          </p>
        )}
      </div>

      <ErrorBox>{state?.error}</ErrorBox>
      <Button disabled={pending} className="self-start">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}