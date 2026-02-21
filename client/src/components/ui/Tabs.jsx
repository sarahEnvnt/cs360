import { T } from '../../theme.js';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.bg, borderRadius: 10, padding: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
          background: active === t.id ? T.accent + "22" : "transparent", color: active === t.id ? T.accent : T.textS,
          transition: "all .2s",
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}
