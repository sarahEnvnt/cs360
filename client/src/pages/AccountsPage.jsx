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
  const [ownerFilter, setOwnerFilter] = useState('all');

  const handleSaved = () => { setModal(null); refresh(); };

  const owners = [...new Set((accounts || []).map(a => a.assigneeName).filter(Boolean))].sort();
  const filtered = ownerFilter === 'all' ? accounts : (accounts || []).filter(a => ownerFilter === 'unassigned' ? !a.assigneeName : a.assigneeName === ownerFilter);

  const filterBtn = (label, value) => (
    <button key={value} onClick={() => setOwnerFilter(value)} style={{
      padding: "5px 12px", fontSize: 11, fontWeight: 500, borderRadius: 6, cursor: "pointer",
      border: `1px solid ${ownerFilter === value ? T.accent : T.border}`,
      background: ownerFilter === value ? T.accent + '18' : 'transparent',
      color: ownerFilter === value ? T.accent : T.textS, fontFamily: "inherit", transition: "all .15s",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: T.textS }}>{filtered?.length || 0} account(s)</span>
          <span style={{ borderLeft: `1px solid ${T.border}`, height: 16, margin: "0 4px" }} />
          {filterBtn('All', 'all')}
          {owners.map(o => filterBtn(o, o))}
          {filterBtn('Unassigned', 'unassigned')}
        </div>
        <Btn onClick={() => setModal('add')}>+ Add Account</Btn>
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState icon="🏢" message={ownerFilter === 'all' ? "No accounts yet. Start by adding your first account." : "No accounts match this filter."} action="+ Add Account" onAction={() => setModal('add')} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {filtered.map(a => {
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
