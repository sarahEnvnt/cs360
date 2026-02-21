import { T, fmtNum, priColors } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.js';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { StatBox } from '../components/ui/StatBox.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { MiniBar } from '../components/ui/MiniBar.jsx';
import { HealthRing } from '../components/ui/HealthRing.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => dashboardApi.getKpis(), []);
  const { data: summary } = useApi(() => dashboardApi.getSummary(), []);
  const { data: upcoming } = useApi(() => dashboardApi.getUpcomingActivities(), []);

  const k = kpis || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatBox icon="🏢" label="Total Accounts" value={k.totalAccounts || 0} sub={`${k.healthyAccounts || 0} healthy`} color={T.ok} />
        <StatBox icon="💰" label="Active Revenue" value={fmtNum(k.totalActiveRevenue)} sub="SAR" />
        <StatBox icon="🔮" label="Pipeline" value={fmtNum(k.totalPipeline)} sub="SAR" color={T.info} />
        <StatBox icon="📋" label="Active Projects" value={k.activeProjectsCount || 0} />
        <StatBox icon="😀" label="Avg CSAT" value={k.overallAvgCsat ? k.overallAvgCsat + "%" : "N/A"} color={k.overallAvgCsat >= 80 ? T.ok : T.warn} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Account Health Distribution */}
        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Account Health Distribution</h4>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Healthy", count: k.healthyAccounts || 0, color: T.ok },
              { label: "Needs Attention", count: k.attentionAccounts || 0, color: T.warn },
              { label: "At Risk", count: k.riskAccounts || 0, color: T.err },
            ].map(x => (
              <div key={x.label} style={{ flex: 1, textAlign: "center", padding: 16, background: x.color + "10", borderRadius: 10, border: `1px solid ${x.color}22` }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: x.color }}>{x.count}</div>
                <div style={{ fontSize: 11, color: T.textS, marginTop: 4 }}>{x.label}</div>
              </div>
            ))}
          </div>
          {summary && summary.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {summary.map(a => {
                const h = Number(a.healthScore) || 0;
                return (
                  <div key={a.id} onClick={() => navigate(`/accounts/${a.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, cursor: "pointer" }}>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text }}>{a.name}</div>
                    <div style={{ width: 100 }}><MiniBar value={h} color={h >= 80 ? T.ok : h >= 60 ? T.warn : T.err} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: h >= 80 ? T.ok : h >= 60 ? T.warn : T.err, width: 36, textAlign: "right" }}>{h}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Activities */}
        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Upcoming Activities</h4>
          {(!upcoming || upcoming.length === 0) ? <div style={{ color: T.textS, fontSize: 13 }}>No upcoming activities.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, borderLeft: `3px solid ${priColors[a.priority] || T.accent}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: T.textS }}>{a.accountName} {a.date ? `\u2022 ${a.date}` : ''}</div>
                  </div>
                  <Badge color={priColors[a.priority]}>{a.priority}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* CSAT Overview */}
      {summary && summary.filter(a => a.avgCsat != null).length > 0 && (
        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Satisfaction Scores by Account</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {summary.filter(a => a.avgCsat != null || (Number(a.healthScore) || 0) > 0).map(a => (
              <div key={a.id} style={{ padding: 14, background: "rgba(255,255,255,.02)", borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>{a.name}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {a.avgCsat != null && <div><div style={{ fontSize: 20, fontWeight: 700, color: a.avgCsat >= 80 ? T.ok : a.avgCsat >= 60 ? T.warn : T.err }}>{a.avgCsat}%</div><div style={{ fontSize: 10, color: T.textS }}>CSAT</div></div>}
                  {a.npsScore != null && <div><div style={{ fontSize: 20, fontWeight: 700, color: a.npsScore >= 50 ? T.ok : a.npsScore >= 0 ? T.warn : T.err }}>{a.npsScore}</div><div style={{ fontSize: 10, color: T.textS }}>NPS</div></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
