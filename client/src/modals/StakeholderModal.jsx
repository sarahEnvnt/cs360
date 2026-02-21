import { useState, useEffect } from 'react';
import { stakeholdersApi } from '../api/stakeholders.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

export default function StakeholderModal({ open, onClose, onSaved, accountId, stakeholder }) {
  const isEdit = !!stakeholder;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(stakeholder ? { ...stakeholder } : {});
    setError('');
  }, [stakeholder, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      const data = { ...form, influence: Number(form.influence) || 0 };
      if (isEdit) await stakeholdersApi.update(accountId, stakeholder.id, data);
      else await stakeholdersApi.create(accountId, data);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Stakeholder" : "Add Stakeholder"}>
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
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name} onClick={handleSave}>{isEdit ? "Save" : "Add Stakeholder"}</Btn>
      </div>
    </Modal>
  );
}
