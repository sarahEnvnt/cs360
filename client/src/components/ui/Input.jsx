import { T } from '../../theme.js';

const datePickerCSS = `
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
  opacity: 1;
  padding: 4px;
  border-radius: 4px;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  filter: invert(0.7);
  background: rgba(201,162,39,0.15);
}
`;

let dateStyleInjected = false;
function ensureDateStyles() {
  if (dateStyleInjected) return;
  const s = document.createElement("style");
  s.textContent = datePickerCSS;
  document.head.appendChild(s);
  dateStyleInjected = true;
}

export function Input({ label, value, onChange, type = "text", placeholder, options, rows, style, required }) {
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const displayValue = type === "date" && value && value.length > 10 ? value.slice(0, 10) : value;
  if (type === "date") ensureDateStyles();
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
        <input type={type} value={displayValue} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, ...(type === "date" ? { cursor: "pointer" } : {}) }} />
      )}
    </div>
  );
}
