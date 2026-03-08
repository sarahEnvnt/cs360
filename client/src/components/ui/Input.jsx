import { forwardRef } from 'react';
import { T } from '../../theme.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const datePickerOverrides = `
.react-datepicker-wrapper { width: 100%; }
.react-datepicker__input-container { width: 100%; }
.react-datepicker-popper { z-index: 9999 !important; }
.react-datepicker {
  background: var(--dp-bg) !important;
  border: 1px solid var(--dp-border) !important;
  border-radius: 10px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
  overflow: hidden;
}
.react-datepicker__header {
  background: var(--dp-header-bg) !important;
  border-bottom: 1px solid var(--dp-border) !important;
  padding-top: 10px !important;
}
.react-datepicker__current-month,
.react-datepicker__day-name {
  color: var(--dp-text) !important;
  font-weight: 600 !important;
}
.react-datepicker__day {
  color: var(--dp-text) !important;
  border-radius: 6px !important;
  transition: background 0.15s !important;
}
.react-datepicker__day:hover {
  background: var(--dp-hover) !important;
}
.react-datepicker__day--selected,
.react-datepicker__day--keyboard-selected {
  background: #C9A227 !important;
  color: #0A0F1C !important;
  font-weight: 600 !important;
}
.react-datepicker__day--today {
  font-weight: 700 !important;
  border: 1px solid #C9A227 !important;
}
.react-datepicker__day--outside-month {
  opacity: 0.35 !important;
}
.react-datepicker__navigation-icon::before {
  border-color: var(--dp-text) !important;
}
.react-datepicker__triangle { display: none !important; }
.react-datepicker__year-dropdown,
.react-datepicker__month-dropdown {
  background: var(--dp-bg) !important;
  border: 1px solid var(--dp-border) !important;
}
.react-datepicker__year-option,
.react-datepicker__month-option {
  color: var(--dp-text) !important;
}
.react-datepicker__year-option:hover,
.react-datepicker__month-option:hover {
  background: var(--dp-hover) !important;
}
.react-datepicker__month-dropdown-container select,
.react-datepicker__year-dropdown-container select,
.react-datepicker__month-dropdown-container--select select,
.react-datepicker__year-dropdown-container--select select {
  background: var(--dp-bg) !important;
  color: var(--dp-text) !important;
  border: 1px solid var(--dp-border) !important;
  border-radius: 6px !important;
  padding: 4px 8px !important;
  font-size: 13px !important;
  cursor: pointer !important;
}
.react-datepicker__month-dropdown-container--select,
.react-datepicker__year-dropdown-container--select {
  margin: 0 4px !important;
}
.react-datepicker__close-icon::after {
  background-color: transparent !important;
  color: #fff !important;
  font-size: 16px !important;
}
.react-datepicker__close-icon:hover::after {
  color: #C9A227 !important;
}
#dp-portal { position: relative; z-index: 9999; }
`;

let dpStyleInjected = false;
function ensureDatePickerStyles() {
  if (dpStyleInjected) return;
  const s = document.createElement("style");
  s.textContent = datePickerOverrides;
  document.head.appendChild(s);
  dpStyleInjected = true;
}

function ensurePortalDiv() {
  let el = document.getElementById('dp-portal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'dp-portal';
    document.body.appendChild(el);
  }
  return el;
}

function setDPThemeVars() {
  const root = document.documentElement;
  // Detect dark mode from theme token colors
  const isDark = T.bg === '#080C14' || T.bg === '#0B1120' || T.text === '#EAEDF3' || T.text === '#E2E8F0';
  if (isDark) {
    root.style.setProperty('--dp-bg', '#131925');
    root.style.setProperty('--dp-header-bg', '#0E1320');
    root.style.setProperty('--dp-border', '#1E293B');
    root.style.setProperty('--dp-text', '#E2E8F0');
    root.style.setProperty('--dp-hover', '#1E293B');
  } else {
    root.style.setProperty('--dp-bg', '#FFFFFF');
    root.style.setProperty('--dp-header-bg', '#F8FAFC');
    root.style.setProperty('--dp-border', '#E2E8F0');
    root.style.setProperty('--dp-text', '#1E293B');
    root.style.setProperty('--dp-hover', '#F1F5F9');
  }
}

const DateInput = forwardRef(({ value, onClick, placeholder, baseStyle }, ref) => (
  <input
    ref={ref}
    value={value || ''}
    onClick={onClick}
    placeholder={placeholder}
    readOnly
    style={{ ...baseStyle, cursor: "pointer" }}
  />
));

export function Input({ label, value, onChange, type = "text", placeholder, options, rows, style, required }) {
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  if (type === "date") {
    ensureDatePickerStyles();
    setDPThemeVars();
    ensurePortalDiv();

    const parsed = value ? new Date(value + (value.length === 10 ? 'T00:00:00' : '')) : null;
    const selected = parsed && !isNaN(parsed.getTime()) ? parsed : null;

    return (
      <div style={{ marginBottom: 12, ...style }}>
        {label && <label style={{ display: "block", fontSize: 11, color: T.textS, marginBottom: 4, fontWeight: 500 }}>{label}{required && <span style={{ color: T.err }}> *</span>}</label>}
        <DatePicker
          selected={selected}
          onChange={(date) => {
            if (date) {
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
            } else {
              onChange('');
            }
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText={placeholder || "Select date..."}
          isClearable
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          portalId="dp-portal"
          customInput={<DateInput baseStyle={base} placeholder={placeholder || "Select date..."} />}
        />
      </div>
    );
  }

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
