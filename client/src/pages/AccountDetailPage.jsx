import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { T, fmtNum, hDims, hDimKeys, roleColors, sentColors, priColors, statusColors } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { accountsApi } from '../api/accounts.js';
import { stakeholdersApi } from '../api/stakeholders.js';
import { projectsApi } from '../api/projects.js';
import { activitiesApi } from '../api/activities.js';
import { healthApi } from '../api/healthScores.js';
import { responsesApi } from '../api/surveyResponses.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { MiniBar } from '../components/ui/MiniBar.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { HealthRing } from '../components/ui/HealthRing.jsx';
import AccountModal from '../modals/AccountModal.jsx';
import StakeholderModal from '../modals/StakeholderModal.jsx';
import ProjectModal from '../modals/ProjectModal.jsx';
import ActivityModal from '../modals/ActivityModal.jsx';
import SurveyResponseModal from '../modals/SurveyResponseModal.jsx';
import HealthScoreModal from '../modals/HealthScoreModal.jsx';
import { exportAccountExcel } from '../utils/exportExcel.js';

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const { data: account, refresh: refreshAcct } = useApi(() => accountsApi.get(id), [id]);
  const { data: stakeholders, refresh: refreshStk } = useApi(() => stakeholdersApi.list(id), [id]);
  const { data: projects, refresh: refreshPrj } = useApi(() => projectsApi.list(id), [id]);
  const { data: activities, refresh: refreshAct } = useApi(() => activitiesApi.list(id), [id]);
  const { data: healthScores, refresh: refreshHealth } = useApi(() => healthApi.list(id), [id]);
  const { data: responses, refresh: refreshResp } = useApi(() => responsesApi.list(id), [id]);

  const latestHealth = healthScores?.[0] || {};
  const overallHealth = Number(latestHealth.overallScore) || 0;

  // Compute NPS from responses
  const npsResps = (responses || []).filter(r => r.nps != null);
  const npsScore = npsResps.length ? Math.round(((npsResps.filter(r => r.nps >= 9).length - npsResps.filter(r => r.nps <= 6).length) / npsResps.length) * 100) : null;

  const openEdit = (type, item) => { setEditItem(item); setModal(type); };
  const closeModal = () => { setModal(null); setEditItem(null); };

  if (!account) return <div style={{ color: T.textS, padding: 40 }}>Loading account...</div>;

  const tabs = [
    { id: "overview", icon: "\u25C8", label: "Overview" },
    { id: "stakeholders", icon: "👥", label: `Stakeholders (${stakeholders?.length || 0})` },
    { id: "projects", icon: "📋", label: `Projects (${projects?.length || 0})` },
    { id: "activities", icon: "▷", label: `Activities (${activities?.length || 0})` },
    { id: "health", icon: "♡", label: "Health" },
    { id: "surveys", icon: "\u2605", label: `Surveys (${responses?.length || 0})` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <Card style={{ background: `linear-gradient(135deg, ${T.card}, #151A2E)`, borderColor: T.accent + "33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <button onClick={() => navigate('/accounts')} style={{ background: "none", border: "none", color: T.textS, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8 }}>{"\u2190"} Back to Accounts</button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>{account.name}</h2>
            {account.nameAr && <div style={{ fontSize: 13, color: T.accent, marginTop: 2 }}>{account.nameAr}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Badge color={T.info}>{account.sector}</Badge>
              {account.ministry && <Badge>{account.ministry}</Badge>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <HealthRing value={overallHealth} size={70} sw={5} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Btn onClick={() => exportAccountExcel(account, stakeholders, projects, activities, healthScores, responses)} variant="ghost" style={{ fontSize: 11 }}>Export Excel</Btn>
              <Btn onClick={() => openEdit('edit-account', account)} variant="ghost" style={{ fontSize: 11 }}>Edit</Btn>
              <Btn onClick={async () => { await accountsApi.remove(id); navigate('/accounts'); }} variant="ghost" color={T.err} style={{ fontSize: 11 }}>Delete</Btn>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* OVERVIEW — Smart Dashboard */}
      {tab === "overview" && (() => {
        const activeProjects = (projects || []).filter(p => p.status === 'active');
        const pipelineProjects = (projects || []).filter(p => p.status === 'leads' || p.status === 'exploration');
        const activeRevenue = activeProjects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
        const pipelineValue = pipelineProjects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
        const topStakeholders = [...(stakeholders || [])].sort((a, b) => (b.influence || 0) - (a.influence || 0)).slice(0, 4);
        const championsCount = (stakeholders || []).filter(s => s.sentiment === 'champion').length;
        const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const recentActivities = (activities || []).filter(a => a.date && new Date(a.date) >= tenDaysAgo).sort((a, b) => new Date(b.date) - new Date(a.date));
        const topProjects = [...(projects || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        const healthCol = v => v >= 80 ? T.ok : v >= 60 ? T.warn : T.err;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Row 1: KPI Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Card style={{ textAlign: "center", padding: "20px 12px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: healthCol(overallHealth) }}>{overallHealth}%</div>
                <div style={{ fontSize: 10, color: T.textS, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>Health Score</div>
              </Card>
              <Card style={{ textAlign: "center", padding: "20px 12px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: npsScore != null ? (npsScore >= 50 ? T.ok : npsScore >= 0 ? T.warn : T.err) : T.textD }}>{npsScore != null ? npsScore : "\u2014"}</div>
                <div style={{ fontSize: 10, color: T.textS, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>NPS Score</div>
              </Card>
              <Card style={{ textAlign: "center", padding: "20px 12px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: T.accent }}>{fmtNum(activeRevenue)}</div>
                <div style={{ fontSize: 10, color: T.textS, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>Active Projects (SAR)</div>
              </Card>
            </div>

            {/* Row 2: Health Dimensions + Key Stakeholders */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <h4 style={{ margin: "0 0 14px", fontSize: 14, color: T.text }}>Health Dimensions</h4>
                {!healthScores?.length ? <div style={{ fontSize: 12, color: T.textS }}>No health assessment yet.</div> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {hDims.map(d => {
                      const v = Number(latestHealth[hDimKeys[d]]) || 0;
                      return (
                        <div key={d}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textS, marginBottom: 3 }}>
                            <span>{d}</span><span style={{ fontWeight: 600, color: healthCol(v) }}>{v}%</span>
                          </div>
                          <MiniBar value={v} color={healthCol(v)} h={6} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
              <Card>
                <h4 style={{ margin: "0 0 14px", fontSize: 14, color: T.text }}>Key Stakeholders</h4>
                {!topStakeholders.length ? <div style={{ fontSize: 12, color: T.textS }}>No stakeholders yet.</div> : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {topStakeholders.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: (roleColors[s.role] || T.accent) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: roleColors[s.role] || T.accent, flexShrink: 0 }}>{s.name?.[0]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                            <div style={{ fontSize: 10, color: T.textS }}>{s.title || s.role}</div>
                          </div>
                          <div style={{ width: 60 }}><MiniBar value={s.influence || 0} max={10} color={sentColors[s.sentiment] || T.accent} h={5} /></div>
                          <Badge color={sentColors[s.sentiment]} style={{ fontSize: 9, padding: "2px 6px" }}>{s.sentiment || "unknown"}</Badge>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.textS }}>
                      <span>Total: {stakeholders?.length || 0}</span>
                      <span style={{ color: T.ok }}>Champions: {championsCount}</span>
                    </div>
                  </>
                )}
              </Card>
            </div>

            {/* Row 3: Projects Overview */}
            <Card>
              <h4 style={{ margin: "0 0 14px", fontSize: 14, color: T.text }}>Projects Overview</h4>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                {[['Active', activeProjects.length, T.ok], ['Leads', pipelineProjects.length, T.info], ['Completed', (projects || []).filter(p => p.status === 'completed').length, T.textS]].map(([l, c, col]) => (
                  <div key={l} style={{ flex: 1, textAlign: "center", padding: "10px 0", background: col + "11", borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{c}</div>
                    <div style={{ fontSize: 9, color: T.textS, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textS, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                <span>Active Projects: <span style={{ color: T.accent, fontWeight: 600 }}>{fmtNum(activeRevenue)} SAR</span></span>
                <span>Leads: <span style={{ color: T.info, fontWeight: 600 }}>{fmtNum(pipelineValue)} SAR</span></span>
              </div>
              {!topProjects.length ? <div style={{ fontSize: 12, color: T.textS }}>No projects yet.</div> : topProjects.map(p => {
                const planned = (p.startDate && p.timeframe && Number(p.timeframe) > 0)
                  ? Math.min(100, Math.max(0, Math.round(((new Date() - new Date(p.startDate)) / 86400000) / Number(p.timeframe) * 100)))
                  : null;
                const actual = p.progress != null ? Number(p.progress) : null;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Badge color={statusColors[p.status]} style={{ fontSize: 9, padding: "2px 6px" }}>{p.status}</Badge>
                    <div style={{ flex: 1, fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {planned != null && <div style={{ width: 40, display: "flex", alignItems: "center", gap: 3 }}><MiniBar value={planned} color={T.info} h={4} /><span style={{ fontSize: 9, color: T.info }}>{planned}%</span></div>}
                      {actual != null && <div style={{ width: 40, display: "flex", alignItems: "center", gap: 3 }}><MiniBar value={actual} color={actual >= 70 ? T.ok : actual >= 40 ? T.warn : T.info} h={4} /><span style={{ fontSize: 9, color: T.text }}>{actual}%</span></div>}
                    </div>
                    <span style={{ fontSize: 11, color: T.accent, fontWeight: 600, flexShrink: 0 }}>{p.budget ? fmtNum(p.budget) : ""}</span>
                  </div>
                );
              })}
            </Card>

            {/* Row 4: Recent Activities (last 10 days) */}
            <Card>
              <h4 style={{ margin: "0 0 14px", fontSize: 14, color: T.text }}>Recent Activities <span style={{ fontSize: 11, fontWeight: 400, color: T.textS }}>(last 10 days)</span></h4>
              {!recentActivities.length ? <div style={{ fontSize: 12, color: T.textS }}>No activities in the last 10 days.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentActivities.map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, borderLeft: `3px solid ${priColors[a.priority] || T.accent}`, alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.name}</div>
                        <div style={{ fontSize: 10, color: T.textS, marginTop: 2 }}>
                          {a.type && <span>{a.type} {"\u2022"} </span>}{a.representative && <span>{a.representative} {"\u2022"} </span>}{a.date}
                        </div>
                      </div>
                      <Badge color={statusColors[a.status]} style={{ fontSize: 9, padding: "2px 6px" }}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Row 5: Summary & Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: T.text }}>Summary</h4>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: T.textS, direction: account.summary?.match(/[\u0600-\u06FF]/) ? "rtl" : "ltr" }}>{account.summary || "No summary provided."}</p>
                {account.challenges && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: T.err, fontWeight: 600, marginBottom: 6 }}>Challenges</div>
                    <p style={{ fontSize: 12, color: T.textS, lineHeight: 1.6 }}>{account.challenges}</p>
                  </div>
                )}
              </Card>
              <Card>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: T.text }}>Alliances & Partners</h4>
                {account.alliances ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {account.alliances.split(",").map((a, i) => <div key={i} style={{ padding: "6px 12px", background: T.accentDim, borderRadius: 8, fontSize: 12, color: T.accent }}>{a.trim()}</div>)}
                  </div>
                ) : <div style={{ fontSize: 13, color: T.textS }}>No alliances recorded.</div>}
                {account.notes && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: T.info, fontWeight: 600, marginBottom: 6 }}>Notes</div>
                    <p style={{ fontSize: 12, color: T.textS, lineHeight: 1.6 }}>{account.notes}</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      })()}

      {/* STAKEHOLDERS */}
      {tab === "stakeholders" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn onClick={() => setModal('add-stakeholder')}>+ Add Stakeholder</Btn>
          </div>
          {!stakeholders?.length ? <EmptyState icon="👥" message="No stakeholders yet." action="+ Add Stakeholder" onAction={() => setModal('add-stakeholder')} /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {stakeholders.map(s => (
                <Card key={s.id} hover>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: (roleColors[s.role] || T.accent) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: roleColors[s.role] || T.accent }}>{s.name?.[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{s.title}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Badge color={roleColors[s.role]}>{s.role}</Badge>
                      <button onClick={() => openEdit('edit-stakeholder', s)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer", fontSize: 12 }}>✎</button>
                      <button onClick={async () => { await stakeholdersApi.remove(id, s.id); refreshStk(); }} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", fontSize: 12 }}>x</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textS, marginBottom: 3 }}>
                      <span>Influence</span><span>{s.influence}/10</span>
                    </div>
                    <MiniBar value={s.influence || 0} max={10} color={sentColors[s.sentiment] || T.accent} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textS, marginTop: 6 }}>
                      <span>Sentiment: <span style={{ color: sentColors[s.sentiment], fontWeight: 600 }}>{s.sentiment || "unknown"}</span></span>
                      <span>{s.friendFoe || ""}</span>
                    </div>
                    {s.lastMeeting && <div style={{ fontSize: 11, color: T.textD, marginTop: 4 }}>Last meeting: {s.lastMeeting}</div>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROJECTS */}
      {tab === "projects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn onClick={() => setModal('add-project')}>+ Add Project</Btn>
          </div>
          {!projects?.length ? <EmptyState icon="📋" message="No projects yet." action="+ Add Project" onAction={() => setModal('add-project')} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(p => (
                <Card key={p.id} hover>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <Badge color={statusColors[p.status]}>{p.status}</Badge>
                        {p.type && <Badge color={T.purple}>{p.type}</Badge>}
                        {p.timeframe && <span style={{ fontSize: 11, color: T.textS }}>{p.timeframe} days</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>{p.budget ? fmtNum(p.budget) + " SAR" : "TBD"}</div>
                        {p.stakeholder && <div style={{ fontSize: 11, color: T.textS, marginTop: 2 }}>{p.stakeholder}</div>}
                      </div>
                      <button onClick={() => openEdit('edit-project', p)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer" }}>✎</button>
                      <button onClick={async () => { await projectsApi.remove(id, p.id); refreshPrj(); }} style={{ background: "none", border: "none", color: T.err, cursor: "pointer" }}>x</button>
                    </div>
                  </div>
                  {(() => {
                    const planned = (p.startDate && p.timeframe && Number(p.timeframe) > 0)
                      ? Math.min(100, Math.max(0, Math.round(((new Date() - new Date(p.startDate)) / 86400000) / Number(p.timeframe) * 100)))
                      : null;
                    const actual = p.progress != null ? Number(p.progress) : null;
                    return (planned != null || actual != null) ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textS, marginBottom: 3 }}>
                            <span>Planned</span><span style={{ fontWeight: 600, color: T.info }}>{planned != null ? planned + "%" : "\u2014"}</span>
                          </div>
                          <MiniBar value={planned ?? 0} color={T.info} h={6} />
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textS, marginBottom: 3 }}>
                            <span>Actual</span><span style={{ fontWeight: 600, color: actual != null ? (actual >= 70 ? T.ok : actual >= 40 ? T.warn : T.info) : T.textD }}>{actual != null ? actual + "%" : "\u2014"}</span>
                          </div>
                          <MiniBar value={actual ?? 0} color={actual != null ? (actual >= 70 ? T.ok : actual >= 40 ? T.warn : T.info) : T.textD} h={6} />
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {p.probability != null && p.status !== "active" && (
                    <div style={{ marginTop: 8, fontSize: 12, color: T.textS }}>Win probability: <span style={{ color: p.probability >= 60 ? T.ok : T.warn, fontWeight: 600 }}>{p.probability}%</span></div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVITIES */}
      {tab === "activities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn onClick={() => setModal('add-activity')}>+ Add Activity</Btn>
          </div>
          {!activities?.length ? <EmptyState icon="▷" message="No activities yet." action="+ Add Activity" onAction={() => setModal('add-activity')} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activities.map(a => (
                <div key={a.id} style={{ display: "flex", gap: 12, padding: "12px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, borderLeft: `3px solid ${priColors[a.priority] || T.accent}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: T.textS, marginTop: 3 }}>
                      {a.type && <span>{a.type} {"\u2022"} </span>}{a.representative && <span>{a.representative} {"\u2022"} </span>}{a.role && <span>{a.role} {"\u2022"} </span>}{a.date}
                    </div>
                    {a.notes && <div style={{ fontSize: 12, color: T.textS, marginTop: 6 }}>{a.notes}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <Badge color={statusColors[a.status]}>{a.status}</Badge>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEdit('edit-activity', a)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer", fontSize: 11 }}>✎</button>
                      <button onClick={async () => { await activitiesApi.remove(id, a.id); refreshAct(); }} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", fontSize: 11 }}>x</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HEALTH */}
      {tab === "health" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={() => setModal('update-health')}>Update Health Score</Btn>
          </div>
          <Card style={{ textAlign: "center", padding: 32 }}>
            <HealthRing value={overallHealth} size={150} sw={10} />
            <div style={{ fontSize: 12, color: T.textS, marginTop: 12 }}>Overall Account Health</div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {hDims.map(d => {
              const key = hDimKeys[d];
              const v = Number(latestHealth[key]) || 0;
              const col = v >= 80 ? T.ok : v >= 60 ? T.warn : T.err;
              return (
                <Card key={d}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{d}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{v}%</div>
                  </div>
                  <MiniBar value={v} color={col} h={8} />
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SURVEYS */}
      {tab === "surveys" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {npsScore != null && <Badge color={T.info} style={{ fontSize: 13, padding: "6px 14px" }}>NPS: {npsScore}</Badge>}
            </div>
            <Btn onClick={() => setModal('add-response')}>+ Record Survey Response</Btn>
          </div>
          {!responses?.length ? <EmptyState icon="\u2605" message="No survey responses yet for this account." action="+ Record Response" onAction={() => setModal('add-response')} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {responses.map(r => (
                <Card key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{r.respondent || "Anonymous"}</div>
                      <div style={{ fontSize: 11, color: T.textS }}>{r.date} {"\u2022"} {r.surveyName || "General Survey"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      {r.nps != null && <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: r.nps >= 9 ? T.ok : r.nps >= 7 ? T.warn : T.err }}>{r.nps}/10</div><div style={{ fontSize: 9, color: T.textS }}>NPS</div></div>}
                      <button onClick={() => openEdit('edit-response', r)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer", fontSize: 12 }}>✎</button>
                      <button onClick={async () => { await responsesApi.remove(id, r.id); refreshResp(); }} style={{ background: "none", border: "none", color: T.err, cursor: "pointer" }}>x</button>
                    </div>
                  </div>
                  {r.feedback && <div style={{ marginTop: 8, fontSize: 12, color: T.textS, padding: "8px 10px", background: "rgba(255,255,255,.02)", borderRadius: 6 }}>{r.feedback}</div>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <AccountModal open={modal === 'edit-account'} onClose={closeModal} onSaved={() => { closeModal(); refreshAcct(); }} account={editItem} />
      <StakeholderModal open={modal === 'add-stakeholder' || modal === 'edit-stakeholder'} onClose={closeModal} onSaved={() => { closeModal(); refreshStk(); }} accountId={id} stakeholder={modal === 'edit-stakeholder' ? editItem : null} />
      <ProjectModal open={modal === 'add-project' || modal === 'edit-project'} onClose={closeModal} onSaved={() => { closeModal(); refreshPrj(); }} accountId={id} project={modal === 'edit-project' ? editItem : null} stakeholders={stakeholders} />
      <ActivityModal open={modal === 'add-activity' || modal === 'edit-activity'} onClose={closeModal} onSaved={() => { closeModal(); refreshAct(); }} accountId={id} activity={modal === 'edit-activity' ? editItem : null} />
      <SurveyResponseModal open={modal === 'add-response' || modal === 'edit-response'} onClose={closeModal} onSaved={() => { closeModal(); refreshResp(); }} accountId={id} response={modal === 'edit-response' ? editItem : null} />
      <HealthScoreModal open={modal === 'update-health'} onClose={closeModal} onSaved={() => { closeModal(); refreshHealth(); }} accountId={id} latestHealth={latestHealth} />
    </div>
  );
}
