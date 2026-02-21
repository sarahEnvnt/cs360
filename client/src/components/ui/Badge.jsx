import { T } from '../../theme.js';

export function Badge({ children, color = T.accent, style }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, background: color + "20", color, fontSize: 11, fontWeight: 600, letterSpacing: .4, ...style }}>{children}</span>;
}
