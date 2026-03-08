import { T } from '../../theme.js';

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflow: "visible", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textS, fontSize: 20, cursor: "pointer" }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
