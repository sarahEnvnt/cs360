import { T } from '../../theme.js';

export function MiniBar({ value, max = 100, color = T.accent, h = 6 }) {
  return (
    <div style={{ width: "100%", height: h, background: "rgba(255,255,255,.05)", borderRadius: 99 }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .8s ease" }} />
    </div>
  );
}
