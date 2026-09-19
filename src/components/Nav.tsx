import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { Dragon } from "@/lib/dragon";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/dragon", label: "Mi dragón" },
  { href: "/grow", label: "Cuidar" },
  { href: "/journal", label: "Diario" },
  { href: "/chat", label: "Hablar" },
  { href: "/settings", label: "Ajustes" },
];

export function Nav({ dragon }: { dragon: Dragon | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0914]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-xl">🐉</span>
          <span>
            Dragon<span className="text-amber-400">.</span>
          </span>
        </Link>
        {dragon && (
          <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">
          {dragon && (
            <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:inline">
              {dragon.name}
            </span>
          )}
          {dragon && (
            <form action={logoutAction}>
              <button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10">
                Salir
              </button>
            </form>
          )}
        </div>
      </div>
      {dragon && (
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 text-sm sm:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-1 text-zinc-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}