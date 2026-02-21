import { useNavigate } from 'react-router-dom';
import { T, fmtNum } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => dashboardApi.getKpis(), []);
  const { data: summary } = useApi(() => dashboardApi.getSummary(), []);

  const k = kpis || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Portfolio Summary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: T.ok + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.ok }}>{fmtNum(k.totalActiveRevenue)}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Active Revenue (SAR)</div>
          </div>
          <div style={{ padding: 16, background: T.info + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.info }}>{fmtNum(k.totalPipeline)}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Pipeline (SAR)</div>
          </div>
          <div style={{ padding: 16, background: T.accent + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.accent }}>{fmtNum((Number(k.totalActiveRevenue) || 0) + (Number(k.totalPipeline) || 0))}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Total Portfolio (SAR)</div>
          </div>
        </div>
      </Card>

      <Card>
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Account Scorecard</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Account", "Health", "CSAT", "NPS", "Active", "Revenue", "Pipeline"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: T.textS, fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(summary || []).map(a => {
                const h = Number(a.healthScore) || 0;
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => navigate(`/accounts/${a.id}`)}>
                    <td style={{ padding: "10px", fontWeight: 600, color: T.text }}>{a.name}</td>
                    <td style={{ padding: "10px" }}><Badge color={h >= 80 ? T.ok : h >= 60 ? T.warn : T.err}>{h}%</Badge></td>
                    <td style={{ padding: "10px", color: T.textS }}>{a.avgCsat != null ? a.avgCsat + "%" : "\u2014"}</td>
                    <td style={{ padding: "10px", color: T.textS }}>{a.npsScore != null ? a.npsScore : "\u2014"}</td>
                    <td style={{ padding: "10px", color: T.textS }}>{a.activeProjects || 0}</td>
                    <td style={{ padding: "10px", color: T.ok }}>{Number(a.activeRevenue) ? fmtNum(a.activeRevenue) : "\u2014"}</td>
                    <td style={{ padding: "10px", color: T.info }}>{Number(a.pipelineValue) ? fmtNum(a.pipelineValue) : "\u2014"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
