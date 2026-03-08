import { useState, useEffect, useCallback, useRef } from "react";

// ─── THEME ───
const T = {
  bg: "#080C14", card: "#0F1524", cardH: "#151D30", border: "rgba(255,255,255,0.07)",
  accent: "#C9A227", accentDim: "rgba(201,162,39,0.12)", accentBr: "#E8C547",
  text: "#EAEDF3", textS: "#6B7A94", textD: "#3D4A5F",
  ok: "#2DD4A0", warn: "#F0B429", err: "#EF6461", info: "#5B9CF6",
  purple: "#A78BFA", pink: "#F472B6",
};

// ─── STORAGE ───
const SK = {
  accounts: "cs360:accounts", stakeholders: "cs360:stkh", projects: "cs360:proj",
  activities: "cs360:actv", surveys: "cs360:surv", responses: "cs360:resp", health: "cs360:hlth",
};

async function sGet(k) {
  try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function sSet(k, v) {
  try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error("Storage error:", e); }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ─── SMALL COMPONENTS ───
function Card({ children, style, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)} onClick={onClick}
      style={{ background: h ? T.cardH : T.card, border: `1px solid ${h ? T.accent + "33" : T.border}`, borderRadius: 14, padding: 20, transition: "all .2s", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function Badge({ children, color = T.accent, style }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, background: color + "20", color, fontSize: 11, fontWeight: 600, letterSpacing: .4, ...style }}>{children}</span>;
}

function MiniBar({ value, max = 100, color = T.accent, h = 6 }) {
  return (
    <div style={{ width: "100%", height: h, background: "rgba(255,255,255,.05)", borderRadius: 99 }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .8s ease" }} />
    </div>
  );
}

function StatBox({ icon, label, value, sub, color = T.accent }) {
  return (
    <Card style={{ textAlign: "center", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{value}</div>
      <div style={{ fontSize: 10, color: T.textS, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function Btn({ children, onClick, color = T.accent, variant = "filled", style, disabled }) {
  const filled = variant === "filled";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 18px", borderRadius: 8, border: filled ? "none" : `1px solid ${color}44`,
      background: filled ? color : "transparent", color: filled ? "#000" : color,
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .5 : 1, transition: "all .2s", ...style,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, options, rows, style, required }) {
  const base = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && <label style={{ display: "block", fontSize: 11, color: T.textS, marginBottom: 4, fontWeight: 500 }}>{label}{required && <span style={{ color: T.err }}> *</span>}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
          <option value="">Select...</option>
          {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "85vh", overflow: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textS, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.bg, borderRadius: 10, padding: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
          background: active === t.id ? T.accent + "22" : "transparent", color: active === t.id ? T.accent : T.textS,
          transition: "all .2s",
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}

function EmptyState({ icon, message, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: 48, color: T.textS }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, marginBottom: 16 }}>{message}</div>
      {action && <Btn onClick={onAction}>{action}</Btn>}
    </div>
  );
}

function HealthRing({ value, size = 100, sw = 7 }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  const col = value >= 80 ? T.ok : value >= 60 ? T.warn : T.err;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "all 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size / 4.5, fontWeight: 700, color: T.text }}>{value}%</div>
    </div>
  );
}

const fmtNum = n => n ? Number(n).toLocaleString("en") : "0";
const hDims = ["Product Adoption", "Stakeholder Engagement", "Support Satisfaction", "Renewal Likelihood", "Expansion Potential", "Strategic Alignment"];
const roleColors = { DM: T.err, REC: T.warn, INF: T.info, CHM: T.ok };
const sentColors = { champion: T.ok, positive: "#4ADE80", neutral: T.warn, unknown: T.textS, negative: T.err };
const priColors = { critical: T.err, high: T.warn, medium: T.info, low: T.textS };
const statusColors = { active: T.ok, pipeline: T.info, exploration: T.warn, completed: T.textS, planned: T.info, upcoming: T.accent, in_progress: T.ok, done: T.textS, overdue: T.err };

// ─── MAIN APP ───
export default function CS360() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selAcct, setSelAcct] = useState(null);
  const [acctTab, setAcctTab] = useState("overview");
  const [data, setData] = useState({ accounts: [], stakeholders: [], projects: [], activities: [], surveys: [], responses: [], health: [] });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  // Load all data
  useEffect(() => {
    (async () => {
      const [accounts, stakeholders, projects, activities, surveys, responses, health] = await Promise.all(
        Object.values(SK).map(k => sGet(k))
      );
      setData({ accounts, stakeholders, projects, activities, surveys, responses, health });
      setLoading(false);
    })();
  }, []);

  // Save helper
  const save = useCallback(async (key, items) => {
    const storeKey = SK[key];
    setData(prev => ({ ...prev, [key]: items }));
    await sSet(storeKey, items);
  }, []);

  const addItem = (key, item) => save(key, [...data[key], { ...item, id: uid(), createdAt: new Date().toISOString() }]);
  const updateItem = (key, id, updates) => save(key, data[key].map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
  const deleteItem = (key, id) => save(key, data[key].filter(i => i.id !== id));

  const openModal = (type, defaults = {}) => { setModal(type); setForm(defaults); };
  const closeModal = () => { setModal(null); setForm({}); };
  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Computed
  const acctHealth = (acctId) => {
    const h = data.health.filter(x => x.accountId === acctId).sort((a, b) => b.createdAt?.localeCompare(a.createdAt))[0];
    if (!h) return 0;
    const vals = hDims.map(d => h[d] || 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const acctCSAT = (acctId) => {
    const resps = data.responses.filter(r => r.accountId === acctId && r.csat != null);
    if (!resps.length) return null;
    return Math.round(resps.reduce((a, r) => a + r.csat, 0) / resps.length);
  };

  const acctNPS = (acctId) => {
    const resps = data.responses.filter(r => r.accountId === acctId && r.nps != null);
    if (!resps.length) return null;
    const p = resps.filter(r => r.nps >= 9).length;
    const d = resps.filter(r => r.nps <= 6).length;
    return Math.round(((p - d) / resps.length) * 100);
  };

  const totalRevenue = data.projects.filter(p => p.status === "active").reduce((a, p) => a + (Number(p.budget) || 0), 0);
  const totalPipeline = data.projects.filter(p => p.status !== "active" && p.status !== "completed").reduce((a, p) => a + (Number(p.budget) || 0), 0);

  const goAcct = (id) => { setSelAcct(id); setPage("account-detail"); setAcctTab("overview"); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, color: T.accent, fontSize: 16 }}>
      Loading CS360...
    </div>
  );

  const selAccount = data.accounts.find(a => a.id === selAcct);
  const acctStk = data.stakeholders.filter(s => s.accountId === selAcct);
  const acctPrj = data.projects.filter(p => p.accountId === selAcct);
  const acctAct = data.activities.filter(a => a.accountId === selAcct);
  const acctSurv = data.surveys.filter(s => s.accountId === selAcct);
  const acctResp = data.responses.filter(r => r.accountId === selAcct);

  // ─── NAV ───
  const nav = [
    { id: "dashboard", icon: "◆", label: "Executive Dashboard" },
    { id: "accounts", icon: "◈", label: "Accounts" },
    { id: "surveys", icon: "★", label: "Surveys & CSAT" },
    { id: "reports", icon: "◉", label: "Reports" },
  ];

  // ════════════════════════════════════════
  // ─── RENDER: EXECUTIVE DASHBOARD ───
  // ════════════════════════════════════════
  const renderDashboard = () => {
    const accts = data.accounts;
    const healthDist = { healthy: 0, attention: 0, risk: 0 };
    accts.forEach(a => { const h = acctHealth(a.id); if (h >= 80) healthDist.healthy++; else if (h >= 60) healthDist.attention++; else healthDist.risk++; });
    const allCSATs = accts.map(a => ({ name: a.name, csat: acctCSAT(a.id), nps: acctNPS(a.id), health: acctHealth(a.id) })).filter(x => x.csat !== null || x.health > 0);
    const avgCSAT = allCSATs.length ? Math.round(allCSATs.filter(x => x.csat).reduce((a, x) => a + x.csat, 0) / allCSATs.filter(x => x.csat).length) : 0;
    const upcomingActs = data.activities.filter(a => a.status !== "done").sort((a, b) => (a.date || "").localeCompare(b.date || "")).slice(0, 6);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <StatBox icon="🏢" label="Total Accounts" value={accts.length} sub={`${healthDist.healthy} healthy`} color={T.ok} />
          <StatBox icon="💰" label="Active Revenue" value={fmtNum(totalRevenue)} sub="SAR" />
          <StatBox icon="🔮" label="Pipeline" value={fmtNum(totalPipeline)} sub="SAR" color={T.info} />
          <StatBox icon="📋" label="Active Projects" value={data.projects.filter(p => p.status === "active").length} />
          <StatBox icon="😀" label="Avg CSAT" value={avgCSAT ? avgCSAT + "%" : "N/A"} color={avgCSAT >= 80 ? T.ok : T.warn} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Account Health Distribution */}
          <Card>
            <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>📊 Account Health Distribution</h4>
            {accts.length === 0 ? <div style={{ color: T.textS, fontSize: 13 }}>No accounts yet. Add your first account to see health data.</div> : (
              <div style={{ display: "flex", gap: 16 }}>
                {[{ label: "Healthy", count: healthDist.healthy, color: T.ok }, { label: "Needs Attention", count: healthDist.attention, color: T.warn }, { label: "At Risk", count: healthDist.risk, color: T.err }].map(x => (
                  <div key={x.label} style={{ flex: 1, textAlign: "center", padding: 16, background: x.color + "10", borderRadius: 10, border: `1px solid ${x.color}22` }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: x.color }}>{x.count}</div>
                    <div style={{ fontSize: 11, color: T.textS, marginTop: 4 }}>{x.label}</div>
                  </div>
                ))}
              </div>
            )}
            {accts.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {accts.map(a => {
                  const h = acctHealth(a.id);
                  return (
                    <div key={a.id} onClick={() => goAcct(a.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, cursor: "pointer" }}>
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
            <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>📅 Upcoming Activities</h4>
            {upcomingActs.length === 0 ? <div style={{ color: T.textS, fontSize: 13 }}>No upcoming activities.</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcomingActs.map(a => {
                  const acct = data.accounts.find(x => x.id === a.accountId);
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, borderLeft: `3px solid ${priColors[a.priority] || T.accent}` }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{acct?.name} • {a.date}</div>
                      </div>
                      <Badge color={priColors[a.priority]}>{a.priority}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* CSAT Overview */}
        {allCSATs.length > 0 && (
          <Card>
            <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>😀 Satisfaction Scores by Account</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {allCSATs.map((a, i) => (
                <div key={i} style={{ padding: 14, background: "rgba(255,255,255,.02)", borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {a.csat != null && <div><div style={{ fontSize: 20, fontWeight: 700, color: a.csat >= 80 ? T.ok : a.csat >= 60 ? T.warn : T.err }}>{a.csat}%</div><div style={{ fontSize: 10, color: T.textS }}>CSAT</div></div>}
                    {a.nps != null && <div><div style={{ fontSize: 20, fontWeight: 700, color: a.nps >= 50 ? T.ok : a.nps >= 0 ? T.warn : T.err }}>{a.nps}</div><div style={{ fontSize: 10, color: T.textS }}>NPS</div></div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════
  // ─── RENDER: ACCOUNTS LIST ───
  // ════════════════════════════════════════
  const renderAccounts = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: T.textS }}>{data.accounts.length} account(s)</div>
        <Btn onClick={() => openModal("add-account")}>+ Add Account</Btn>
      </div>
      {data.accounts.length === 0 ? (
        <EmptyState icon="🏢" message="No accounts yet. Start by adding your first account." action="+ Add Account" onAction={() => openModal("add-account")} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {data.accounts.map(a => {
            const h = acctHealth(a.id);
            const prjCount = data.projects.filter(p => p.accountId === a.id).length;
            const stkCount = data.stakeholders.filter(s => s.accountId === a.id).length;
            const csat = acctCSAT(a.id);
            return (
              <Card key={a.id} hover onClick={() => goAcct(a.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{a.name}</div>
                    {a.nameAr && <div style={{ fontSize: 12, color: T.accent, marginTop: 2 }}>{a.nameAr}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <Badge color={T.info}>{a.sector || "N/A"}</Badge>
                      {a.ministry && <Badge>{a.ministry}</Badge>}
                    </div>
                  </div>
                  <HealthRing value={h} size={56} sw={4} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12, color: T.textS }}>
                  <span>👥 {stkCount} contacts</span>
                  <span>📋 {prjCount} projects</span>
                  {csat != null && <span>😀 CSAT: {csat}%</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════
  // ─── RENDER: ACCOUNT DETAIL ───
  // ════════════════════════════════════════
  const renderAccountDetail = () => {
    if (!selAccount) return <div style={{ color: T.textS }}>Account not found.</div>;
    const h = acctHealth(selAcct);
    const latestHealth = data.health.filter(x => x.accountId === selAcct).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0] || {};
    const tabs = [
      { id: "overview", icon: "◈", label: "Overview" },
      { id: "stakeholders", icon: "👥", label: `Stakeholders (${acctStk.length})` },
      { id: "projects", icon: "📋", label: `Projects (${acctPrj.length})` },
      { id: "activities", icon: "▷", label: `Activities (${acctAct.length})` },
      { id: "health", icon: "♡", label: "Health" },
      { id: "surveys", icon: "★", label: `Surveys (${acctSurv.length})` },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <Card style={{ background: `linear-gradient(135deg, ${T.card}, #151A2E)`, borderColor: T.accent + "33" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <button onClick={() => setPage("accounts")} style={{ background: "none", border: "none", color: T.textS, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8 }}>← Back to Accounts</button>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>{selAccount.name}</h2>
              {selAccount.nameAr && <div style={{ fontSize: 13, color: T.accent, marginTop: 2 }}>{selAccount.nameAr}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Badge color={T.info}>{selAccount.sector}</Badge>
                {selAccount.ministry && <Badge>{selAccount.ministry}</Badge>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <HealthRing value={h} size={70} sw={5} />
              <div>
                <Btn onClick={() => openModal("edit-account", selAccount)} variant="ghost" style={{ marginBottom: 4, display: "block", fontSize: 11 }}>✎ Edit</Btn>
                <Btn onClick={() => { deleteItem("accounts", selAcct); setPage("accounts"); }} variant="ghost" color={T.err} style={{ fontSize: 11 }}>🗑 Delete</Btn>
              </div>
            </div>
          </div>
        </Card>

        <Tabs tabs={tabs} active={acctTab} onChange={setAcctTab} />

        {/* TAB: Overview */}
        {acctTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: T.text }}>📝 Summary</h4>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: T.textS, direction: selAccount.summary?.match(/[\u0600-\u06FF]/) ? "rtl" : "ltr" }}>{selAccount.summary || "No summary provided."}</p>
              {selAccount.challenges && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: T.err, fontWeight: 600, marginBottom: 6 }}>⚠️ Challenges</div>
                  <p style={{ fontSize: 12, color: T.textS, lineHeight: 1.6 }}>{selAccount.challenges}</p>
                </div>
              )}
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: T.text }}>🤝 Alliances & Partners</h4>
              {selAccount.alliances ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selAccount.alliances.split(",").map((a, i) => <div key={i} style={{ padding: "6px 12px", background: T.accentDim, borderRadius: 8, fontSize: 12, color: T.accent }}>{a.trim()}</div>)}
                </div>
              ) : <div style={{ fontSize: 13, color: T.textS }}>No alliances recorded.</div>}
              {selAccount.notes && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: T.info, fontWeight: 600, marginBottom: 6 }}>📌 Notes</div>
                  <p style={{ fontSize: 12, color: T.textS, lineHeight: 1.6 }}>{selAccount.notes}</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB: Stakeholders */}
        {acctTab === "stakeholders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Btn onClick={() => openModal("add-stakeholder", { accountId: selAcct })}>+ Add Stakeholder</Btn>
            </div>
            {acctStk.length === 0 ? <EmptyState icon="👥" message="No stakeholders yet." action="+ Add Stakeholder" onAction={() => openModal("add-stakeholder", { accountId: selAcct })} /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {acctStk.map(s => (
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
                        <button onClick={() => openModal("edit-stakeholder", s)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer", fontSize: 12 }}>✎</button>
                        <button onClick={() => deleteItem("stakeholders", s.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", fontSize: 12 }}>×</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textS, marginBottom: 3 }}>
                        <span>Influence</span><span>{s.influence}/10</span>
                      </div>
                      <MiniBar value={s.influence} max={10} color={sentColors[s.sentiment] || T.accent} />
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

        {/* TAB: Projects */}
        {acctTab === "projects" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Btn onClick={() => openModal("add-project", { accountId: selAcct })}>+ Add Project</Btn>
            </div>
            {acctPrj.length === 0 ? <EmptyState icon="📋" message="No projects yet." action="+ Add Project" onAction={() => openModal("add-project", { accountId: selAcct })} /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {acctPrj.map(p => (
                  <Card key={p.id} hover>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{p.name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <Badge color={statusColors[p.status]}>{p.status}</Badge>
                          {p.type && <Badge color={T.purple}>{p.type}</Badge>}
                          {p.timeframe && <span style={{ fontSize: 11, color: T.textS }}>⏱ {p.timeframe}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>{p.budget ? fmtNum(p.budget) + " SAR" : "TBD"}</div>
                          {p.stakeholder && <div style={{ fontSize: 11, color: T.textS, marginTop: 2 }}>{p.stakeholder}</div>}
                        </div>
                        <button onClick={() => openModal("edit-project", p)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer" }}>✎</button>
                        <button onClick={() => deleteItem("projects", p.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer" }}>×</button>
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

        {/* TAB: Activities */}
        {acctTab === "activities" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Btn onClick={() => openModal("add-activity", { accountId: selAcct })}>+ Add Activity</Btn>
            </div>
            {acctAct.length === 0 ? <EmptyState icon="▷" message="No activities yet." action="+ Add Activity" onAction={() => openModal("add-activity", { accountId: selAcct })} /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {acctAct.sort((a, b) => (a.date || "").localeCompare(b.date || "")).map(a => (
                  <div key={a.id} style={{ display: "flex", gap: 12, padding: "12px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, borderLeft: `3px solid ${priColors[a.priority] || T.accent}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: T.textS, marginTop: 3 }}>
                        {a.type && <span>{a.type} • </span>}{a.representative && <span>{a.representative} • </span>}{a.role && <span>{a.role} • </span>}{a.date}
                      </div>
                      {a.notes && <div style={{ fontSize: 12, color: T.textS, marginTop: 6 }}>{a.notes}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <Badge color={statusColors[a.status]}>{a.status}</Badge>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openModal("edit-activity", a)} style={{ background: "none", border: "none", color: T.textS, cursor: "pointer", fontSize: 11 }}>✎</button>
                        <button onClick={() => deleteItem("activities", a.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", fontSize: 11 }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Health */}
        {acctTab === "health" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div />
              <Btn onClick={() => openModal("update-health", { accountId: selAcct, ...Object.fromEntries(hDims.map(d => [d, latestHealth[d] || 50])) })}>Update Health Score</Btn>
            </div>
            <Card style={{ textAlign: "center", padding: 32 }}>
              <HealthRing value={h} size={150} sw={10} />
              <div style={{ fontSize: 12, color: T.textS, marginTop: 12 }}>Overall Account Health</div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {hDims.map((d, i) => {
                const v = latestHealth[d] || 0;
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

        {/* TAB: Surveys */}
        {acctTab === "surveys" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {acctCSAT(selAcct) != null && <Badge color={T.ok} style={{ fontSize: 13, padding: "6px 14px" }}>CSAT: {acctCSAT(selAcct)}%</Badge>}
                {acctNPS(selAcct) != null && <Badge color={T.info} style={{ fontSize: 13, padding: "6px 14px" }}>NPS: {acctNPS(selAcct)}</Badge>}
              </div>
              <Btn onClick={() => openModal("add-response", { accountId: selAcct })}>+ Record Survey Response</Btn>
            </div>
            {acctResp.length === 0 ? <EmptyState icon="★" message="No survey responses yet for this account." action="+ Record Response" onAction={() => openModal("add-response", { accountId: selAcct })} /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {acctResp.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(r => (
                  <Card key={r.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{r.respondent || "Anonymous"}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{r.date} • {r.surveyName || "General Survey"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {r.csat != null && <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: r.csat >= 80 ? T.ok : r.csat >= 60 ? T.warn : T.err }}>{r.csat}%</div><div style={{ fontSize: 9, color: T.textS }}>CSAT</div></div>}
                        {r.nps != null && <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: r.nps >= 9 ? T.ok : r.nps >= 7 ? T.warn : T.err }}>{r.nps}/10</div><div style={{ fontSize: 9, color: T.textS }}>NPS</div></div>}
                        <button onClick={() => deleteItem("responses", r.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                    {r.feedback && <div style={{ marginTop: 8, fontSize: 12, color: T.textS, padding: "8px 10px", background: "rgba(255,255,255,.02)", borderRadius: 6 }}>{r.feedback}</div>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════
  // ─── RENDER: SURVEYS GLOBAL ───
  // ════════════════════════════════════════
  const renderSurveys = () => {
    const allResps = data.responses;
    const totalCSAT = allResps.filter(r => r.csat != null);
    const avgCSAT = totalCSAT.length ? Math.round(totalCSAT.reduce((a, r) => a + r.csat, 0) / totalCSAT.length) : 0;
    const totalNPS = allResps.filter(r => r.nps != null);
    const npsScore = totalNPS.length ? Math.round(((totalNPS.filter(r => r.nps >= 9).length - totalNPS.filter(r => r.nps <= 6).length) / totalNPS.length) * 100) : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <StatBox icon="😀" label="Overall CSAT" value={avgCSAT ? avgCSAT + "%" : "N/A"} color={avgCSAT >= 80 ? T.ok : T.warn} />
          <StatBox icon="📊" label="NPS Score" value={totalNPS.length ? npsScore : "N/A"} color={npsScore >= 50 ? T.ok : npsScore >= 0 ? T.warn : T.err} />
          <StatBox icon="📝" label="Total Responses" value={allResps.length} />
          <StatBox icon="🏢" label="Accounts Surveyed" value={new Set(allResps.map(r => r.accountId)).size} />
        </div>

        <Card>
          <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>📊 CSAT by Account</h4>
          {data.accounts.length === 0 ? <div style={{ color: T.textS, fontSize: 13 }}>Add accounts first.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.accounts.map(a => {
                const csat = acctCSAT(a.id);
                const nps = acctNPS(a.id);
                const cnt = data.responses.filter(r => r.accountId === a.id).length;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: T.textS }}>{cnt} responses</div>
                    {csat != null && <Badge color={csat >= 80 ? T.ok : csat >= 60 ? T.warn : T.err}>CSAT: {csat}%</Badge>}
                    {nps != null && <Badge color={nps >= 50 ? T.ok : nps >= 0 ? T.warn : T.err}>NPS: {nps}</Badge>}
                    <Btn variant="ghost" onClick={() => { goAcct(a.id); setTimeout(() => setAcctTab("surveys"), 100); }} style={{ fontSize: 11 }}>View →</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {allResps.length > 0 && (
          <Card>
            <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>📋 Recent Responses</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allResps.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 10).map(r => {
                const acct = data.accounts.find(a => a.id === r.accountId);
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{r.respondent || "Anonymous"} — {acct?.name}</div>
                      <div style={{ fontSize: 11, color: T.textS }}>{r.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {r.csat != null && <Badge color={r.csat >= 80 ? T.ok : T.warn}>CSAT: {r.csat}%</Badge>}
                      {r.nps != null && <Badge color={r.nps >= 9 ? T.ok : T.warn}>NPS: {r.nps}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════
  // ─── RENDER: REPORTS ───
  // ════════════════════════════════════════
  const renderReports = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>📊 Portfolio Summary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, background: T.ok + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.ok }}>{fmtNum(totalRevenue)}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Active Revenue (SAR)</div>
          </div>
          <div style={{ padding: 16, background: T.info + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.info }}>{fmtNum(totalPipeline)}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Pipeline (SAR)</div>
          </div>
          <div style={{ padding: 16, background: T.accent + "10", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.accent }}>{fmtNum(totalRevenue + totalPipeline)}</div>
            <div style={{ fontSize: 11, color: T.textS }}>Total Portfolio (SAR)</div>
          </div>
        </div>
      </Card>

      <Card>
        <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: T.text }}>🏢 Account Scorecard</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Account", "Health", "CSAT", "NPS", "Projects", "Revenue", "Pipeline"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: T.textS, fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.accounts.map(a => {
                const h = acctHealth(a.id);
                const csat = acctCSAT(a.id);
                const nps = acctNPS(a.id);
                const prjs = data.projects.filter(p => p.accountId === a.id);
                const rev = prjs.filter(p => p.status === "active").reduce((s, p) => s + (Number(p.budget) || 0), 0);
                const pipe = prjs.filter(p => p.status !== "active" && p.status !== "completed").reduce((s, p) => s + (Number(p.budget) || 0), 0);
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}` }} onClick={() => goAcct(a.id)}>
                    <td style={{ padding: "10px", fontWeight: 600, color: T.text, cursor: "pointer" }}>{a.name}</td>
                    <td style={{ padding: "10px" }}><Badge color={h >= 80 ? T.ok : h >= 60 ? T.warn : T.err}>{h}%</Badge></td>
                    <td style={{ padding: "10px", color: T.textS }}>{csat != null ? csat + "%" : "—"}</td>
                    <td style={{ padding: "10px", color: T.textS }}>{nps != null ? nps : "—"}</td>
                    <td style={{ padding: "10px", color: T.textS }}>{prjs.length}</td>
                    <td style={{ padding: "10px", color: T.ok }}>{rev ? fmtNum(rev) : "—"}</td>
                    <td style={{ padding: "10px", color: T.info }}>{pipe ? fmtNum(pipe) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ════════════════════════════════════════
  // ─── MODALS ───
  // ════════════════════════════════════════
  const renderModals = () => (
    <>
      {/* ADD/EDIT ACCOUNT */}
      <Modal open={modal === "add-account" || modal === "edit-account"} onClose={closeModal} title={modal === "edit-account" ? "Edit Account" : "Add New Account"}>
        <Input label="Account Name (EN)" value={form.name || ""} onChange={v => setF("name", v)} required placeholder="e.g. SAIS" />
        <Input label="Account Name (AR)" value={form.nameAr || ""} onChange={v => setF("nameAr", v)} placeholder="e.g. الهيئة العليا للأمن الصناعي" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Sector" value={form.sector || ""} onChange={v => setF("sector", v)} options={["Government", "Banking", "Telecom", "Insurance", "Energy", "Healthcare", "Education", "Other"]} />
          <Input label="Parent Ministry/Org" value={form.ministry || ""} onChange={v => setF("ministry", v)} placeholder="e.g. Ministry of Interior" />
        </div>
        <Input label="Business Summary" value={form.summary || ""} onChange={v => setF("summary", v)} rows={3} placeholder="Brief description of the account..." />
        <Input label="Key Challenges" value={form.challenges || ""} onChange={v => setF("challenges", v)} rows={2} placeholder="Current challenges facing the account..." />
        <Input label="Alliances (comma-separated)" value={form.alliances || ""} onChange={v => setF("alliances", v)} placeholder="e.g. PSS, Civil Defense, NCA" />
        <Input label="Notes" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={() => {
            if (modal === "edit-account") { updateItem("accounts", form.id, form); }
            else { addItem("accounts", form); }
            closeModal();
          }}>{modal === "edit-account" ? "Save Changes" : "Add Account"}</Btn>
        </div>
      </Modal>

      {/* ADD/EDIT STAKEHOLDER */}
      <Modal open={modal === "add-stakeholder" || modal === "edit-stakeholder"} onClose={closeModal} title={modal === "edit-stakeholder" ? "Edit Stakeholder" : "Add Stakeholder"}>
        <Input label="Full Name" value={form.name || ""} onChange={v => setF("name", v)} required />
        <Input label="Title / Position" value={form.title || ""} onChange={v => setF("title", v)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Role" value={form.role || ""} onChange={v => setF("role", v)} options={[{ value: "DM", label: "Decision Maker (DM)" }, { value: "REC", label: "Recommender (REC)" }, { value: "INF", label: "Influencer (INF)" }, { value: "CHM", label: "Champion (CHM)" }]} />
          <Input label="Influence (1-10)" value={form.influence || ""} onChange={v => setF("influence", v)} type="number" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Sentiment" value={form.sentiment || ""} onChange={v => setF("sentiment", v)} options={["champion", "positive", "neutral", "unknown", "negative"]} />
          <Input label="Friend / Foe" value={form.friendFoe || ""} onChange={v => setF("friendFoe", v)} options={["Friend", "Neutral", "Foe", "Unknown"]} />
        </div>
        <Input label="Contact Info" value={form.contacts || ""} onChange={v => setF("contacts", v)} placeholder="Email, phone..." />
        <Input label="Last Meeting Date" value={form.lastMeeting || ""} onChange={v => setF("lastMeeting", v)} type="date" />
        <Input label="Notes" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={() => {
            const item = { ...form, influence: Number(form.influence) || 0 };
            if (modal === "edit-stakeholder") updateItem("stakeholders", form.id, item);
            else addItem("stakeholders", item);
            closeModal();
          }}>{modal === "edit-stakeholder" ? "Save" : "Add Stakeholder"}</Btn>
        </div>
      </Modal>

      {/* ADD/EDIT PROJECT */}
      <Modal open={modal === "add-project" || modal === "edit-project"} onClose={closeModal} title={modal === "edit-project" ? "Edit Project" : "Add Project"}>
        <Input label="Project Name" value={form.name || ""} onChange={v => setF("name", v)} required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Type" value={form.type || ""} onChange={v => setF("type", v)} options={["FM", "CR", "License", "Extension", "New", "Strategy", "Other"]} />
          <Input label="Status" value={form.status || ""} onChange={v => setF("status", v)} options={["active", "pipeline", "exploration", "completed"]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Budget (SAR)" value={form.budget || ""} onChange={v => setF("budget", v)} type="number" />
          <Input label="Timeframe" value={form.timeframe || ""} onChange={v => setF("timeframe", v)} placeholder="e.g. 12 months" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Progress %" value={form.progress ?? ""} onChange={v => setF("progress", v)} type="number" />
          <Input label="Win Probability %" value={form.probability ?? ""} onChange={v => setF("probability", v)} type="number" />
        </div>
        <Input label="Stakeholder / Decision Maker" value={form.stakeholder || ""} onChange={v => setF("stakeholder", v)} />
        <Input label="Vendor" value={form.vendor || ""} onChange={v => setF("vendor", v)} />
        <Input label="Competitors" value={form.competitors || ""} onChange={v => setF("competitors", v)} />
        <Input label="Notes" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={() => {
            const item = { ...form, budget: Number(form.budget) || 0, progress: form.progress !== "" ? Number(form.progress) : null, probability: form.probability !== "" ? Number(form.probability) : null };
            if (modal === "edit-project") updateItem("projects", form.id, item);
            else addItem("projects", item);
            closeModal();
          }}>{modal === "edit-project" ? "Save" : "Add Project"}</Btn>
        </div>
      </Modal>

      {/* ADD/EDIT ACTIVITY */}
      <Modal open={modal === "add-activity" || modal === "edit-activity"} onClose={closeModal} title={modal === "edit-activity" ? "Edit Activity" : "Add Activity"}>
        <Input label="Activity Name" value={form.name || ""} onChange={v => setF("name", v)} required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Type" value={form.type || ""} onChange={v => setF("type", v)} options={["Meeting", "Call", "Workshop", "Presentation", "Email", "Follow-up", "Review", "Other"]} />
          <Input label="Date" value={form.date || ""} onChange={v => setF("date", v)} type="date" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Priority" value={form.priority || ""} onChange={v => setF("priority", v)} options={["critical", "high", "medium", "low"]} />
          <Input label="Status" value={form.status || ""} onChange={v => setF("status", v)} options={["planned", "upcoming", "in_progress", "done", "overdue"]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Representative" value={form.representative || ""} onChange={v => setF("representative", v)} />
          <Input label="Role in Activity" value={form.role || ""} onChange={v => setF("role", v)} placeholder="e.g. Lead, Presenter" />
        </div>
        <Input label="Notes / Outcome" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={() => {
            if (modal === "edit-activity") updateItem("activities", form.id, form);
            else addItem("activities", form);
            closeModal();
          }}>{modal === "edit-activity" ? "Save" : "Add Activity"}</Btn>
        </div>
      </Modal>

      {/* RECORD SURVEY RESPONSE */}
      <Modal open={modal === "add-response"} onClose={closeModal} title="Record Survey Response">
        <Input label="Respondent Name" value={form.respondent || ""} onChange={v => setF("respondent", v)} placeholder="Person who responded" />
        <Input label="Survey / Occasion" value={form.surveyName || ""} onChange={v => setF("surveyName", v)} placeholder="e.g. Q1 Satisfaction Survey" />
        <Input label="Date" value={form.date || ""} onChange={v => setF("date", v)} type="date" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="CSAT Score (0-100%)" value={form.csat ?? ""} onChange={v => setF("csat", v)} type="number" placeholder="0-100" />
          <Input label="NPS Score (0-10)" value={form.nps ?? ""} onChange={v => setF("nps", v)} type="number" placeholder="0-10" />
        </div>
        <Input label="Overall Satisfaction" value={form.satisfaction || ""} onChange={v => setF("satisfaction", v)} options={["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]} />
        <Input label="Service Quality" value={form.serviceQuality || ""} onChange={v => setF("serviceQuality", v)} options={["Excellent", "Good", "Average", "Poor"]} />
        <Input label="Would Recommend?" value={form.recommend || ""} onChange={v => setF("recommend", v)} options={["Definitely", "Probably", "Not Sure", "Probably Not", "Definitely Not"]} />
        <Input label="Open Feedback" value={form.feedback || ""} onChange={v => setF("feedback", v)} rows={3} placeholder="Any comments or feedback..." />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn onClick={() => {
            addItem("responses", { ...form, csat: form.csat !== "" && form.csat != null ? Number(form.csat) : null, nps: form.nps !== "" && form.nps != null ? Number(form.nps) : null });
            closeModal();
          }}>Record Response</Btn>
        </div>
      </Modal>

      {/* UPDATE HEALTH */}
      <Modal open={modal === "update-health"} onClose={closeModal} title="Update Account Health Score">
        <p style={{ fontSize: 12, color: T.textS, marginBottom: 16 }}>Rate each dimension from 0-100 based on your assessment.</p>
        {hDims.map(d => (
          <div key={d} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: T.text, fontWeight: 500 }}>{d}</span>
              <span style={{ color: T.accent, fontWeight: 600 }}>{form[d] || 0}%</span>
            </div>
            <input type="range" min={0} max={100} value={form[d] || 0} onChange={e => setF(d, Number(e.target.value))}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn onClick={() => {
            const healthItem = { accountId: form.accountId };
            hDims.forEach(d => healthItem[d] = Number(form[d]) || 0);
            addItem("health", healthItem);
            closeModal();
          }}>Save Health Score</Btn>
        </div>
      </Modal>
    </>
  );

  // ════════════════════════════════════════
  // ─── MAIN RENDER ───
  // ════════════════════════════════════════
  const pageContent = {
    dashboard: renderDashboard,
    accounts: renderAccounts,
    "account-detail": renderAccountDetail,
    surveys: renderSurveys,
    reports: renderReports,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: T.text }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: T.card, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${T.accent}, #B8860B)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.bg }}>CS</div>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>CS360</div><div style={{ fontSize: 9, color: T.textS }}>Customer Success Platform</div></div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSelAcct(null); }}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: page === n.id || (n.id === "accounts" && page === "account-detail") ? T.accent + "18" : "transparent", color: page === n.id || (n.id === "accounts" && page === "account-detail") ? T.accent : T.textS, fontSize: 12, fontWeight: page === n.id ? 600 : 400, cursor: "pointer", textAlign: "left", width: "100%", transition: "all .2s" }}>
              <span style={{ fontSize: 13 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px", borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.textD, textAlign: "center" }}>
          v1.0 • Data saved locally
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 28px", borderBottom: `1px solid ${T.border}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>
            {page === "account-detail" ? selAccount?.name || "Account" : nav.find(n => n.id === page)?.label}
          </h1>
          <div style={{ fontSize: 11, color: T.textS }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          {pageContent[page]?.()}
        </div>
      </div>

      {renderModals()}
    </div>
  );
}
