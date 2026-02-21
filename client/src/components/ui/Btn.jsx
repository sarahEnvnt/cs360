import { T } from '../../theme.js';

export function Btn({ children, onClick, color = T.accent, variant = "filled", style, disabled }) {
  const filled = variant === "filled";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 18px", borderRadius: 8, border: filled ? "none" : `1px solid ${color}44`,
      background: filled ? color : "transparent", color: filled ? "#000" : color,
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .5 : 1, transition: "all .2s", ...style,
    }}>{children}</button>
  );
}
