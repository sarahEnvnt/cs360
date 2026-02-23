import { useState, useEffect } from 'react';
import { projectsApi } from '../api/projects.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { MiniBar } from '../components/ui/MiniBar.jsx';
import { T } from '../theme.js';

function calcPlannedProgress(startDate, timeframeDays) {
  if (!startDate || !timeframeDays || Number(timeframeDays) <= 0) return null;
  const elapsed = (new Date() - new Date(startDate)) / 86400000;
  if (elapsed < 0) return 0;
  return Math.min(100, Math.max(0, Math.round((elapsed / Number(timeframeDays)) * 100)));
}

export default function ProjectModal({ open, onClose, onSaved, accountId, project, stakeholders }) {
  const isEdit = !!project;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(project ? { ...project } : {});
    setError('');
  }, [project, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const plannedProgress = calcPlannedProgress(form.startDate, form.timeframe);

  const handleSave = async () => {
    try {
      const data = {
        ...form,
        budget: Number(form.budget) || 0,
        progress: form.progress !== "" && form.progress != null ? Number(form.progress) : null,
        probability: form.probability !== "" && form.probability != null ? Number(form.probability) : null,
      };
      if (isEdit) await projectsApi.update(accountId, project.id, data);
      else await projectsApi.create(accountId, data);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  const stakeOpts = (stakeholders || []).map(s => ({ value: s.name, label: s.name }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Project" : "Add Project"}>
      <Input label="Project Name" value={form.name || ""} onChange={v => setF("name", v)} required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Type" value={form.type || ""} onChange={v => setF("type", v)} options={["FM", "CR", "License", "Extension", "New", "Strategy", "Other"]} />
        <Input label="Status" value={form.status || ""} onChange={v => setF("status", v)} options={["active", "leads", "exploration", "completed"]} />
      </div>
      <Input label="Budget (SAR)" value={form.budget || ""} onChange={v => setF("budget", v)} type="number" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Start Date" value={form.startDate || ""} onChange={v => setF("startDate", v)} type="date" />
        <Input label="Timeframe (Days)" value={form.timeframe || ""} onChange={v => setF("timeframe", v)} type="number" placeholder="e.g. 90" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, color: T.textS, marginBottom: 4, fontWeight: 500 }}>Planned Progress</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ flex: 1 }}><MiniBar value={plannedProgress ?? 0} color={T.info} h={6} /></div>
            <span style={{ fontSize: 13, fontWeight: 600, color: plannedProgress != null ? T.info : T.textD }}>{plannedProgress != null ? plannedProgress + "%" : "\u2014"}</span>
          </div>
        </div>
        <Input label="Actual Progress %" value={form.progress ?? ""} onChange={v => setF("progress", v)} type="number" />
      </div>
      <Input label="Win Probability %" value={form.probability ?? ""} onChange={v => setF("probability", v)} type="number" />
      <Input label="Stakeholder / Decision Maker" value={form.stakeholder || ""} onChange={v => setF("stakeholder", v)} options={stakeOpts} />
      <Input label="Vendor" value={form.vendor || ""} onChange={v => setF("vendor", v)} />
      <Input label="Competitors" value={form.competitors || ""} onChange={v => setF("competitors", v)} />
      <Input label="Notes" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name} onClick={handleSave}>{isEdit ? "Save" : "Add Project"}</Btn>
      </div>
    </Modal>
  );
}
