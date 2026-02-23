import { T } from '../../theme.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export function TopBar({ title }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  return (
    <div style={{ padding: "12px 28px", borderBottom: `1px solid ${T.border}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
      <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 11, color: T.textS }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
        <button
          onClick={toggleTheme}
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1px solid ${T.border}`, background: "transparent",
            color: T.textS, cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color .2s, border-color .2s",
          }}
        >
          {mode === 'dark' ? '\u2600' : '\u263D'}
        </button>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: T.text }}>{user.name}</span>
            <button onClick={logout} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.textS, fontSize: 11, cursor: "pointer" }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
