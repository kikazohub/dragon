import { STAGES } from "@/lib/options";
import type { Stage } from "@/lib/options";

interface DragonVisualProps {
  stage: Stage;
  scaleColor: string;
  elementColor: string;
  glow: string;
  hornStyle?: string;
  wingStyle?: string;
  animated?: boolean;
}

export function DragonVisual({
  stage,
  scaleColor,
  elementColor,
  glow,
  hornStyle = "nudos",
  wingStyle = "ningunas",
  animated = true,
}: DragonVisualProps) {
  const stageIdx = STAGES.findIndex((s) => s.id === stage.id);
  const scale = Math.max(0.45, 0.45 + stageIdx * 0.15);
  const cx = 200;
  const cy = 155;
  const fx = (1 - scale) * cx;
  const fy = (1 - scale) * cy;

  const horns =
    hornStyle === "rectos"
      ? "horns-straight"
      : hornStyle === "curvos"
        ? "horns-curved"
        : hornStyle === "ramificados"
          ? "horns-branched"
          : "horns-nubs";

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-64 w-64 rounded-full blur-3xl opacity-30"
        style={{ background: glow }}
      />
      <svg
        viewBox="0 0 400 310"
        className={`w-64 h-64 md:w-80 md:h-80 ${animated ? "animate-dragon-float" : ""}`}
        role="img"
        aria-label={`Dragón ${stage.name}`}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor={scaleColor} />
          </radialGradient>
          <linearGradient id="bellyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde8c8" />
            <stop offset="100%" stopColor="#f5c98d" />
          </linearGradient>
        </defs>

        <g transform={`translate(${fx} ${fy}) scale(${scale})`}>
          {/* cola */}
          <path
            d="M 100 190 Q 45 195 30 150 Q 18 100 60 108 Q 38 108 40 138 Q 42 165 75 172"
            fill={scaleColor}
            stroke={scaleColor}
            strokeWidth="2"
          />
          <path
            d="M 52 108 L 30 78 L 70 102 Z"
            fill={elementColor}
            opacity="0.9"
          />

          {/* aleta trasera */}
          <ellipse cx="150" cy="235" rx="20" ry="10" fill={scaleColor} />
          <ellipse cx="235" cy="240" rx="18" ry="10" fill={scaleColor} />

          {/* cuerpo */}
          <ellipse cx="175" cy="185" rx="90" ry="62" fill="url(#bodyGrad)" />
          <ellipse cx="195" cy="200" rx="52" ry="36" fill="url(#bellyGrad)" opacity="0.85" />

          {/* espinas del lomo */}
          {[
            [210, 138],
            [232, 152],
          ].map(([x, y], i) =>
            i === 0 ? (
              <path key={i} d={`M ${x} ${y} L ${x + 8} ${y - 22} L ${x + 16} ${y} Z`} fill={elementColor} opacity="0.9" />
            ) : (
              <path key={i} d={`M ${x - 6} ${y} L ${x} ${y - 18} L ${x + 8} ${y} Z`} fill={elementColor} opacity="0.75" />
            )
          )}

          {/* ala trasera */}
          {wingStyle !== "ningunas" && (
            <g fill={scaleColor} opacity="0.6">
              <path d="M 180 140 C 150 100 90 70 60 90 C 90 120 140 145 180 160 Z" />
            </g>
          )}

          {/* cuello */}
          <path
            d="M 205 160 C 235 140 255 135 275 150 L 250 185 C 230 175 215 172 200 185 Z"
            fill="url(#bodyGrad)"
          />

          {/* cabeza */}
          <ellipse cx="292" cy="118" rx="52" ry="45" fill="url(#bodyGrad)" />
          {/* hocico */}
          <ellipse cx="330" cy="132" rx="34" ry="24" fill={scaleColor} />
          <ellipse cx="344" cy="124" rx="8" ry="6" fill="#3a2a20" />
          <path d="M 356 140 q -6 8 -16 6" stroke="#3a2a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* ojo */}
          <circle cx="300" cy="104" r="12" fill="#ffe9b8" />
          <circle cx="303" cy="104" r="7" fill="#1d160f" />
          <circle cx="305" cy="102" r="2.4" fill="#ffffff" />
          {/* ceja */}
          <path d="M 284 90 q 14 -8 28 -2" stroke={scaleColor} strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* cuernos por estilo */}
          {horns === "horns-nubs" && (
            <>
              <circle cx="272" cy="80" r="8" fill="#e8d5b0" />
              <circle cx="300" cy="74" r="7" fill="#e8d5b0" />
            </>
          )}
          {horns === "horns-straight" && (
            <>
              <path d="M 270 84 L 250 40 L 284 76 Z" fill="#e8d5b0" />
              <path d="M 302 78 L 296 32 L 322 72 Z" fill="#e8d5b0" />
            </>
          )}
          {horns === "horns-curved" && (
            <>
              <path d="M 268 84 Q 238 40 260 30 Q 246 54 282 74 Z" fill="#e8d5b0" />
              <path d="M 304 78 Q 290 30 312 22 Q 300 48 328 70 Z" fill="#e8d5b0" />
            </>
          )}
          {horns === "horns-branched" && (
            <>
              <path d="M 268 84 L 252 46 L 284 76 Z" fill="#e8d5b0" />
              <path d="M 262 60 L 240 48 L 268 62 Z" fill="#e8d5b0" opacity="0.9" />
              <path d="M 300 82 L 292 40 L 322 74 Z" fill="#e8d5b0" />
              <path d="M 295 56 L 278 38 L 302 58 Z" fill="#e8d5b0" opacity="0.9" />
            </>
          )}

          {/* proa del ala */}
          {wingStyle !== "ningunas" && (
            <g>
              {wingStyle === "emplumadas" ? (
                <>
                  <path d="M 200 150 C 170 60 80 30 60 50 C 95 95 150 130 200 160 Z" fill={scaleColor} />
                  <path d="M 196 156 C 165 85 105 60 80 75 C 105 110 145 135 196 160 Z" fill="#f4f0e8" opacity="0.8" />
                  <path d="M 194 160 C 175 105 130 82 105 95 C 120 120 150 140 194 164 Z" fill="#e9e2d4" opacity="0.8" />
                </>
              ) : (
                <>
                  <path
                    d="M 205 145 C 185 55 95 15 45 35 C 80 85 135 125 205 165 Z"
                    fill={scaleColor}
                    stroke={elementColor}
                    strokeWidth="2"
                  />
                  <path d="M 200 155 C 130 120 85 85 52 48" stroke="#00000022" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 202 160 C 150 130 110 95 75 62" stroke="#00000022" strokeWidth="2" fill="none" strokeLinecap="round" />
                  {wingStyle === "cristal" && (
                    <path d="M 195 140 C 185 70 110 40 65 55 C 95 95 145 130 195 160 Z" fill={glow} opacity="0.5" />
                  )}
                </>
              )}
            </g>
          )}

          {/* aleta delantera */}
          <path d="M 215 210 Q 240 255 226 275 Q 258 272 260 268 L 262 222 Z" fill={scaleColor} />
          <path d="M 190 205 Q 205 255 195 272 Q 168 270 170 266 L 178 214 Z" fill={scaleColor} />
        </g>
      </svg>
    </div>
  );
}