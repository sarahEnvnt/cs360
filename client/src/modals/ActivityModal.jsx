import { useState, useEffect } from 'react';
import { activitiesApi } from '../api/activities.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

export default function ActivityModal({ open, onClose, onSaved, accountId, activity }) {
  const isEdit = !!activity;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(activity ? { ...activity } : {});
    setError('');
  }, [activity, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      if (isEdit) await activitiesApi.update(accountId, activity.id, form);
      else await activitiesApi.create(accountId, form);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Activity" : "Add Activity"}>
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
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name} onClick={handleSave}>{isEdit ? "Save" : "Add Activity"}</Btn>
      </div>
    </Modal>
  );
}
