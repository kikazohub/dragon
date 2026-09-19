interface EggProps {
  shell: string;
  spots: string;
  glow: string;
  day: number;
  name?: string;
}

export function Egg({ shell, spots, glow, day, name }: EggProps) {
  const stirring = day >= 1 && day < 3;
  const cracked = day >= 2;
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-56 w-56 rounded-full blur-2xl opacity-40"
        style={{ background: glow }}
      />
      <svg
        viewBox="0 0 200 220"
        className={`h-64 w-64 drop-shadow-[0_0_30px_rgba(255,190,120,0.35)] ${stirring ? "animate-egg-wiggle" : ""}`}
        role="img"
        aria-label={`Huevo de ${name ?? "tu dragón"}`}
      >
        <defs>
          <radialGradient id="eggGrad" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={shell} />
            <stop offset="100%" stopColor={shell} />
          </radialGradient>
          <linearGradient id="eggShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path
          d="M100 18 C58 18 36 62 36 108 C36 152 58 200 100 200 C142 200 164 152 164 108 C164 62 142 18 100 18 Z"
          fill="url(#eggGrad)"
          stroke={shell}
          strokeWidth="1"
        />
        <path
          d="M100 18 C58 18 36 62 36 108 C36 152 58 200 100 200 C142 200 164 152 164 108 C164 62 142 18 100 18 Z"
          fill="url(#eggShine)"
        />
        <ellipse cx="74" cy="66" rx="9" ry="13" fill={spots} opacity="0.7" />
        <ellipse cx="128" cy="96" rx="7" ry="10" fill={spots} opacity="0.6" />
        <ellipse cx="82" cy="150" rx="11" ry="8" fill={spots} opacity="0.55" />
        <ellipse cx="126" cy="168" rx="6" ry="9" fill={spots} opacity="0.5" />
        {cracked && (
          <g stroke="#7a4b2a" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M100 40 L92 66 L98 80 L90 98" />
            <path d="M100 40 L110 62 L104 78 L112 94" />
            <path d="M90 98 L84 112" />
            <path d="M112 94 L119 110" />
          </g>
        )}
      </svg>
      {name && (
        <div className="absolute -bottom-4 rounded-full border border-white/10 bg-black/40 px-4 py-1 text-sm backdrop-blur">
          {name}
        </div>
      )}
    </div>
  );
}