export const T = {
  bg: "#080C14", card: "#0F1524", cardH: "#151D30", border: "rgba(255,255,255,0.07)",
  accent: "#C9A227", accentDim: "rgba(201,162,39,0.12)", accentBr: "#E8C547",
  text: "#EAEDF3", textS: "#6B7A94", textD: "#3D4A5F",
  ok: "#2DD4A0", warn: "#F0B429", err: "#EF6461", info: "#5B9CF6",
  purple: "#A78BFA", pink: "#F472B6",
};

export const fmtNum = n => n ? Number(n).toLocaleString("en") : "0";

export const hDims = ["Product Adoption", "Stakeholder Engagement", "Support Satisfaction", "Renewal Likelihood", "Expansion Potential", "Strategic Alignment"];

// Map display names to camelCase API field names
export const hDimKeys = {
  "Product Adoption": "productAdoption",
  "Stakeholder Engagement": "stakeholderEngagement",
  "Support Satisfaction": "supportSatisfaction",
  "Renewal Likelihood": "renewalLikelihood",
  "Expansion Potential": "expansionPotential",
  "Strategic Alignment": "strategicAlignment",
};

export const roleColors = { DM: T.err, REC: T.warn, INF: T.info, CHM: T.ok };
export const sentColors = { champion: T.ok, positive: "#4ADE80", neutral: T.warn, unknown: T.textS, negative: T.err };
export const priColors = { critical: T.err, high: T.warn, medium: T.info, low: T.textS };
export const statusColors = { active: T.ok, pipeline: T.info, exploration: T.warn, completed: T.textS, planned: T.info, upcoming: T.accent, in_progress: T.ok, done: T.textS, overdue: T.err };
