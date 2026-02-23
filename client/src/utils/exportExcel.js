import * as XLSX from 'xlsx';
import { hDims, hDimKeys } from '../theme.js';

function calcPlannedProgress(startDate, timeframeDays) {
  if (!startDate || !timeframeDays || Number(timeframeDays) <= 0) return null;
  const elapsed = (new Date() - new Date(startDate)) / 86400000;
  if (elapsed < 0) return 0;
  return Math.min(100, Math.max(0, Math.round((elapsed / Number(timeframeDays)) * 100)));
}

export function exportAccountExcel(account, stakeholders, projects, activities, healthScores, responses) {
  const wb = XLSX.utils.book_new();

  // --- Overview ---
  const npsResps = (responses || []).filter(r => r.nps != null);
  const npsScore = npsResps.length
    ? Math.round(((npsResps.filter(r => r.nps >= 9).length - npsResps.filter(r => r.nps <= 6).length) / npsResps.length) * 100)
    : null;
  const overallHealth = Number(healthScores?.[0]?.overallScore) || null;

  const overviewData = [{
    "Name": account.name || "",
    "Name (AR)": account.nameAr || "",
    "Sector": account.sector || "",
    "Ministry": account.ministry || "",
    "Overall Health %": overallHealth,
    "NPS Score": npsScore,
    "Summary": account.summary || "",
    "Challenges": account.challenges || "",
    "Alliances": account.alliances || "",
    "Notes": account.notes || "",
  }];
  const wsOverview = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

  // --- Stakeholders ---
  const stakeData = (stakeholders || []).map(s => ({
    "Name": s.name || "",
    "Title": s.title || "",
    "Role": s.role || "",
    "Influence (/10)": s.influence ?? "",
    "Sentiment": s.sentiment || "",
    "Friend / Foe": s.friendFoe || "",
    "Last Meeting": s.lastMeeting || "",
  }));
  const wsStake = XLSX.utils.json_to_sheet(stakeData.length ? stakeData : [{}], { header: ["Name", "Title", "Role", "Influence (/10)", "Sentiment", "Friend / Foe", "Last Meeting"] });
  XLSX.utils.book_append_sheet(wb, wsStake, "Stakeholders");

  // --- Projects ---
  const projData = (projects || []).map(p => ({
    "Name": p.name || "",
    "Type": p.type || "",
    "Status": p.status || "",
    "Budget (SAR)": p.budget ? Number(p.budget) : "",
    "Start Date": p.startDate || "",
    "Timeframe (Days)": p.timeframe ? Number(p.timeframe) : "",
    "Planned Progress %": calcPlannedProgress(p.startDate, p.timeframe),
    "Actual Progress %": p.progress != null ? Number(p.progress) : "",
    "Win Probability %": p.probability != null ? Number(p.probability) : "",
    "Stakeholder": p.stakeholder || "",
    "Vendor": p.vendor || "",
    "Competitors": p.competitors || "",
    "Notes": p.notes || "",
  }));
  const wsProj = XLSX.utils.json_to_sheet(projData.length ? projData : [{}], { header: ["Name", "Type", "Status", "Budget (SAR)", "Start Date", "Timeframe (Days)", "Planned Progress %", "Actual Progress %", "Win Probability %", "Stakeholder", "Vendor", "Competitors", "Notes"] });
  XLSX.utils.book_append_sheet(wb, wsProj, "Projects");

  // --- Activities ---
  const actData = (activities || []).map(a => ({
    "Name": a.name || "",
    "Type": a.type || "",
    "Status": a.status || "",
    "Priority": a.priority || "",
    "Date": a.date || "",
    "Representative": a.representative || "",
    "Role": a.role || "",
    "Notes": a.notes || "",
  }));
  const wsAct = XLSX.utils.json_to_sheet(actData.length ? actData : [{}], { header: ["Name", "Type", "Status", "Priority", "Date", "Representative", "Role", "Notes"] });
  XLSX.utils.book_append_sheet(wb, wsAct, "Activities");

  // --- Health ---
  const healthHeaders = ["Date", "Overall Score", ...hDims];
  const healthData = (healthScores || []).map(h => {
    const row = {
      "Date": h.assessmentDate || h.createdAt || "",
      "Overall Score": h.overallScore != null ? Number(h.overallScore) : "",
    };
    hDims.forEach(d => { row[d] = h[hDimKeys[d]] != null ? Number(h[hDimKeys[d]]) : ""; });
    return row;
  });
  const wsHealth = XLSX.utils.json_to_sheet(healthData.length ? healthData : [{}], { header: healthHeaders });
  XLSX.utils.book_append_sheet(wb, wsHealth, "Health");

  // --- Surveys ---
  const survData = (responses || []).map(r => ({
    "Respondent": r.respondent || "Anonymous",
    "Date": r.date || "",
    "Survey Name": r.surveyName || "",
    "NPS (/10)": r.nps != null ? Number(r.nps) : "",
    "Feedback": r.feedback || "",
  }));
  const wsSurv = XLSX.utils.json_to_sheet(survData.length ? survData : [{}], { header: ["Respondent", "Date", "Survey Name", "NPS (/10)", "Feedback"] });
  XLSX.utils.book_append_sheet(wb, wsSurv, "Surveys");

  // --- Auto-fit column widths ---
  wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!data.length) return;
    ws['!cols'] = data[0].map((_, col) => {
      let max = 10;
      data.forEach(row => {
        const val = row[col];
        if (val != null) max = Math.max(max, String(val).length);
      });
      return { wch: Math.min(max + 2, 50) };
    });
  });

  // --- Download ---
  const fileName = `${(account.name || "Account").replace(/[^a-zA-Z0-9 ]/g, "")}_CS360_Export.xlsx`;
  XLSX.writeFile(wb, fileName);
}
