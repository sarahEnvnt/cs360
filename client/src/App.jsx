import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { T } from './theme.js';
import { AppLayout } from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import AccountDetailPage from './pages/AccountDetailPage.jsx';
import SurveysPage from './pages/SurveysPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, color: T.accent, fontSize: 16 }}>
      Loading CS360...
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PermissionRoute({ permission, adminOnly, children }) {
  const { user } = useAuth();
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  if (permission && !(user?.permissions || []).includes(permission)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<PermissionRoute permission="dashboard"><DashboardPage /></PermissionRoute>} />
              <Route path="/accounts" element={<PermissionRoute permission="accounts"><AccountsPage /></PermissionRoute>} />
              <Route path="/accounts/:id" element={<PermissionRoute permission="accounts"><AccountDetailPage /></PermissionRoute>} />
              <Route path="/surveys" element={<PermissionRoute permission="surveys"><SurveysPage /></PermissionRoute>} />
              <Route path="/reports" element={<PermissionRoute permission="reports"><ReportsPage /></PermissionRoute>} />
              <Route path="/users" element={<PermissionRoute permission="users" adminOnly><UserManagementPage /></PermissionRoute>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
