import { T } from '../../theme.js';

export function Input({ label, value, onChange, type = "text", placeholder, options, rows, style, required }) {
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && <label style={{ display: "block", fontSize: 11, color: T.textS, marginBottom: 4, fontWeight: 500 }}>{label}{required && <span style={{ color: T.err }}> *</span>}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
          <option value="">Select...</option>
          {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}
