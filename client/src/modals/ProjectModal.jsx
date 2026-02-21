import { useState, useEffect } from 'react';
import { projectsApi } from '../api/projects.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

export default function ProjectModal({ open, onClose, onSaved, accountId, project }) {
  const isEdit = !!project;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(project ? { ...project } : {});
    setError('');
  }, [project, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

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

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Project" : "Add Project"}>
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
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name} onClick={handleSave}>{isEdit ? "Save" : "Add Project"}</Btn>
      </div>
    </Modal>
  );
}
