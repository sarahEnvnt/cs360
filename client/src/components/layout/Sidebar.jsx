import { useLocation, useNavigate } from 'react-router-dom';
import { T } from '../../theme.js';
import { useAuth } from '../../context/AuthContext.jsx';

const nav = [
  { path: "/", icon: "\u25C6", label: "Executive Dashboard", permission: "dashboard" },
  { path: "/accounts", icon: "\u25C8", label: "Accounts", permission: "accounts" },
  { path: "/surveys", icon: "\u2605", label: "Surveys & CSAT", permission: "surveys" },
  { path: "/reports", icon: "\u25C9", label: "Reports", permission: "reports" },
  { path: "/users", icon: "\u2660", label: "User Management", permission: "users", adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const current = location.pathname;
  const userPerms = user?.permissions || [];

  const filteredNav = nav.filter(n => {
    if (n.adminOnly && user?.role !== 'admin') return false;
    return userPerms.includes(n.permission);
  });

  return (
    <div style={{ width: 220, background: T.card, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${T.accent}, #B8860B)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.bg }}>CS</div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>CS360</div><div style={{ fontSize: 9, color: T.textS }}>Customer Success Platform</div></div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredNav.map(n => {
          const isActive = n.path === "/" ? current === "/" : current.startsWith(n.path);
          return (
            <button key={n.path} onClick={() => navigate(n.path)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: isActive ? T.accent + "18" : "transparent", color: isActive ? T.accent : T.textS, fontSize: 12, fontWeight: isActive ? 600 : 400, cursor: "pointer", textAlign: "left", width: "100%", transition: "all .2s" }}>
              <span style={{ fontSize: 13 }}>{n.icon}</span>{n.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px", borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.textD, textAlign: "center" }}>
        v2.0 - PostgreSQL Backend
      </div>
    </div>
  );
}
