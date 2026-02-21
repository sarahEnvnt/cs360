import { useState, useEffect } from 'react';
import { accountsApi } from '../api/accounts.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

export default function AccountModal({ open, onClose, onSaved, account }) {
  const isEdit = !!account;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(account ? { ...account } : {});
    setError('');
  }, [account, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      if (isEdit) await accountsApi.update(account.id, form);
      else await accountsApi.create(form);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Account" : "Add New Account"}>
      <Input label="Account Name (EN)" value={form.name || ""} onChange={v => setF("name", v)} required placeholder="e.g. SAIS" />
      <Input label="Account Name (AR)" value={form.nameAr || ""} onChange={v => setF("nameAr", v)} placeholder="e.g. الهيئة العليا للأمن الصناعي" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Sector" value={form.sector || ""} onChange={v => setF("sector", v)} options={["Government", "Banking", "Telecom", "Insurance", "Energy", "Healthcare", "Education", "Other"]} />
        <Input label="Parent Ministry/Org" value={form.ministry || ""} onChange={v => setF("ministry", v)} placeholder="e.g. Ministry of Interior" />
      </div>
      <Input label="Business Summary" value={form.summary || ""} onChange={v => setF("summary", v)} rows={3} placeholder="Brief description..." />
      <Input label="Key Challenges" value={form.challenges || ""} onChange={v => setF("challenges", v)} rows={2} />
      <Input label="Alliances (comma-separated)" value={form.alliances || ""} onChange={v => setF("alliances", v)} placeholder="e.g. PSS, Civil Defense" />
      <Input label="Notes" value={form.notes || ""} onChange={v => setF("notes", v)} rows={2} />
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name} onClick={handleSave}>{isEdit ? "Save Changes" : "Add Account"}</Btn>
      </div>
    </Modal>
  );
}
