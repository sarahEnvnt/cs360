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

  // Compute CSAT and NPS from responses
  const csatResps = (responses || []).filter(r => r.csat != null);
  const avgCsat = csatResps.length ? Math.round(csatResps.reduce((a, r) => a + r.csat, 0) / csatResps.length) : null;
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
            <div>
              <Btn onClick={() => openEdit('edit-account', account)} variant="ghost" style={{ marginBottom: 4, display: "block", fontSize: 11 }}>Edit</Btn>
              <Btn onClick={async () => { await accountsApi.remove(id); navigate('/accounts'); }} variant="ghost" color={T.err} style={{ fontSize: 11 }}>Delete</Btn>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* OVERVIEW */}
      {tab === "overview" && (
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
      )}

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
                        {p.timeframe && <span style={{ fontSize: 11, color: T.textS }}>{p.timeframe}</span>}
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
                  {p.progress != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                      <div style={{ flex: 1 }}><MiniBar value={p.progress} color={p.progress >= 70 ? T.ok : p.progress >= 40 ? T.warn : T.info} h={7} /></div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.progress}%</span>
                    </div>
                  )}
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
              {avgCsat != null && <Badge color={T.ok} style={{ fontSize: 13, padding: "6px 14px" }}>CSAT: {avgCsat}%</Badge>}
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
                      {r.csat != null && <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: r.csat >= 80 ? T.ok : r.csat >= 60 ? T.warn : T.err }}>{r.csat}%</div><div style={{ fontSize: 9, color: T.textS }}>CSAT</div></div>}
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
      <ProjectModal open={modal === 'add-project' || modal === 'edit-project'} onClose={closeModal} onSaved={() => { closeModal(); refreshPrj(); }} accountId={id} project={modal === 'edit-project' ? editItem : null} />
      <ActivityModal open={modal === 'add-activity' || modal === 'edit-activity'} onClose={closeModal} onSaved={() => { closeModal(); refreshAct(); }} accountId={id} activity={modal === 'edit-activity' ? editItem : null} />
      <SurveyResponseModal open={modal === 'add-response' || modal === 'edit-response'} onClose={closeModal} onSaved={() => { closeModal(); refreshResp(); }} accountId={id} response={modal === 'edit-response' ? editItem : null} />
      <HealthScoreModal open={modal === 'update-health'} onClose={closeModal} onSaved={() => { closeModal(); refreshHealth(); }} accountId={id} latestHealth={latestHealth} />
    </div>
  );
}
