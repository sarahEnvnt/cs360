// ── Color palettes ──
const dark = {
  bg: "#080C14", card: "#0F1524", cardH: "#151D30", border: "rgba(255,255,255,0.07)",
  accent: "#C9A227", accentDim: "rgba(201,162,39,0.12)", accentBr: "#E8C547",
  text: "#EAEDF3", textS: "#6B7A94", textD: "#3D4A5F",
  ok: "#2DD4A0", warn: "#F0B429", err: "#EF6461", info: "#5B9CF6",
  purple: "#A78BFA", pink: "#F472B6",
};

const light = {
  bg: "#F4F6F9", card: "#FFFFFF", cardH: "#F0F2F5", border: "rgba(0,0,0,0.09)",
  accent: "#B08C1A", accentDim: "rgba(176,140,26,0.10)", accentBr: "#C9A227",
  text: "#1A1D23", textS: "#5F6B7A", textD: "#B0B8C4",
  ok: "#16A878", warn: "#D49B1F", err: "#DC4745", info: "#4088E0",
  purple: "#7C5FC4", pink: "#C94A8A",
};

const themes = { dark, light };

// ── Mutable theme object — all 28+ files import this directly ──
export const T = { ...dark };

// ── Apply theme by mutating T in place ──
export function applyTheme(mode) {
  Object.assign(T, themes[mode] || themes.dark);
  // Rebuild derived color maps that reference T
  Object.assign(roleColors, { DM: T.err, REC: T.warn, INF: T.info, CHM: T.ok });
  Object.assign(sentColors, { champion: T.ok, positive: mode === 'dark' ? "#4ADE80" : "#22C55E", neutral: T.warn, unknown: T.textS, negative: T.err });
  Object.assign(priColors, { critical: T.err, high: T.warn, medium: T.info, low: T.textS });
  Object.assign(statusColors, { active: T.ok, leads: T.info, exploration: T.warn, completed: T.textS, planned: T.info, upcoming: T.accent, in_progress: T.ok, done: T.textS, overdue: T.err });
}

// ── Utilities ──
export const fmtNum = n => n ? Number(n).toLocaleString("en") : "0";

export const hDims = ["Product Adoption", "Stakeholder Engagement", "Support Satisfaction", "Renewal Likelihood", "Expansion Potential", "Strategic Alignment"];

export const hDimKeys = {
  "Product Adoption": "productAdoption",
  "Stakeholder Engagement": "stakeholderEngagement",
  "Support Satisfaction": "supportSatisfaction",
  "Renewal Likelihood": "renewalLikelihood",
  "Expansion Potential": "expansionPotential",
  "Strategic Alignment": "strategicAlignment",
};

// ── Derived color maps (mutable, rebuilt by applyTheme) ──
export const roleColors = { DM: T.err, REC: T.warn, INF: T.info, CHM: T.ok };
export const sentColors = { champion: T.ok, positive: "#4ADE80", neutral: T.warn, unknown: T.textS, negative: T.err };
export const priColors = { critical: T.err, high: T.warn, medium: T.info, low: T.textS };
export const statusColors = { active: T.ok, leads: T.info, exploration: T.warn, completed: T.textS, planned: T.info, upcoming: T.accent, in_progress: T.ok, done: T.textS, overdue: T.err };

// ── Apply saved theme on module load ──
const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('cs360_theme') : null;
if (saved) applyTheme(saved);
