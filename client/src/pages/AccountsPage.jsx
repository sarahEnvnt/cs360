import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, fmtNum } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.js';
import { accountsApi } from '../api/accounts.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { HealthRing } from '../components/ui/HealthRing.jsx';
import AccountModal from '../modals/AccountModal.jsx';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { data: accounts, refresh } = useApi(() => dashboardApi.getSummary(), []);
  const [modal, setModal] = useState(null);

  const handleSaved = () => { setModal(null); refresh(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: T.textS }}>{accounts?.length || 0} account(s)</div>
        <Btn onClick={() => setModal('add')}>+ Add Account</Btn>
      </div>

      {!accounts || accounts.length === 0 ? (
        <EmptyState icon="🏢" message="No accounts yet. Start by adding your first account." action="+ Add Account" onAction={() => setModal('add')} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {accounts.map(a => {
            const h = Number(a.healthScore) || 0;
            return (
              <Card key={a.id} hover onClick={() => navigate(`/accounts/${a.id}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{a.name}</div>
                    {a.nameAr && <div style={{ fontSize: 12, color: T.accent, marginTop: 2 }}>{a.nameAr}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <Badge color={T.info}>{a.sector || "N/A"}</Badge>
                    </div>
                  </div>
                  <HealthRing value={h} size={56} sw={4} />
                </div>
                <div style={{ fontSize: 11, color: T.textS, marginTop: 10 }}>Assignee: <span style={{ color: a.assigneeName ? T.text : T.textS }}>{a.assigneeName || "Unassigned"}</span></div>
                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: T.textS, flexWrap: "wrap" }}>
                  {a.npsScore != null && <span>📊 NPS: {a.npsScore}</span>}
                  <span>💰 Active Projects: {fmtNum(a.activeRevenue)}</span>
                  <span>📈 Leads: {fmtNum(a.pipelineValue)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AccountModal open={modal === 'add'} onClose={() => setModal(null)} onSaved={handleSaved} />
    </div>
  );
}
