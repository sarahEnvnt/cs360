import { Outlet, useLocation } from 'react-router-dom';
import { T } from '../../theme.js';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

const titles = {
  "/": "Executive Dashboard",
  "/accounts": "Accounts",
  "/surveys": "Surveys & CSAT",
  "/reports": "Reports",
  "/users": "User Management",
};

export function AppLayout() {
  const location = useLocation();
  const title = titles[location.pathname] || "CS360";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: T.text }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar title={title} />
        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
