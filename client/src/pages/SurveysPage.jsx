import { useNavigate } from 'react-router-dom';
import { T } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.js';
import { Card } from '../components/ui/Card.jsx';
import { StatBox } from '../components/ui/StatBox.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Btn } from '../components/ui/Btn.jsx';

export default function SurveysPage() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => dashboardApi.getKpis(), []);
  const { data: summary } = useApi(() => dashboardApi.getSummary(), []);
  const { data: allResps } = useApi(() => dashboardApi.getAllResponses(), []);

  const k = kpis || {};
  const totalResps = allResps?.length || 0;
  const surveyed = new Set((allResps || []).map(r => r.accountId)).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatBox icon="📊" label="NPS Score" value={k.overallNps != null ? k.overallNps : "N/A"} color={(k.overallNps || 0) >= 50 ? T.ok : (k.overallNps || 0) >= 0 ? T.warn : T.err} />
        <StatBox icon="📝" label="Total Responses" value={totalResps} />
        <StatBox icon="🏢" label="Accounts Surveyed" value={surveyed} />
      </div>

      <Card>
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>NPS by Account</h4>
        {!summary?.length ? <div style={{ color: T.textS, fontSize: 13 }}>Add accounts first.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {summary.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text }}>{a.name}</div>
                <div style={{ fontSize: 11, color: T.textS }}>{a.surveyResponsesCount || 0} responses</div>
                {a.npsScore != null && <Badge color={a.npsScore >= 50 ? T.ok : a.npsScore >= 0 ? T.warn : T.err}>NPS: {a.npsScore}</Badge>}
                <Btn variant="ghost" onClick={() => navigate(`/accounts/${a.id}`)} style={{ fontSize: 11 }}>View {"\u2192"}</Btn>
              </div>
            ))}
          </div>
        )}
      </Card>

      {allResps && allResps.length > 0 && (
        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>Recent Responses</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allResps.slice(0, 10).map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{r.respondent || "Anonymous"} — {r.accountName}</div>
                  <div style={{ fontSize: 11, color: T.textS }}>{r.date}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {r.nps != null && <Badge color={r.nps >= 9 ? T.ok : T.warn}>NPS: {r.nps}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
