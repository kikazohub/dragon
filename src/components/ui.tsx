import type { ReactNode } from "react";
import type { Stage } from "@/lib/options";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40 px-5 py-2.5 ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/60 focus:bg-white/10 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/60 focus:bg-white/10 ${props.className ?? ""}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-zinc-400">{children}</label>;
}

export function ErrorBox({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
      {children}
    </div>
  );
}

export function StageBar({
  stage,
  pct,
  toNext,
}: {
  stage: Stage;
  pct: number;
  toNext: number | null;
}) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-zinc-200">
          {stage.emoji} {stage.name}
        </span>
        {toNext !== null ? (
          <span className="text-zinc-400">{toNext === 0 ? "casi..." : `faltan ${toNext} días`}</span>
        ) : (
          <span className="font-semibold text-amber-300">Forma final</span>
        )}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex min-w-[80px] flex-col items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? "text-white"}`}>{value}</span>
    </div>
  );
}