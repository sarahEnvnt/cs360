import { T } from '../../theme.js';

export function HealthRing({ value, size = 100, sw = 7 }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  const col = value >= 80 ? T.ok : value >= 60 ? T.warn : T.err;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "all 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size / 4.5, fontWeight: 700, color: T.text }}>{value}%</div>
    </div>
  );
}
