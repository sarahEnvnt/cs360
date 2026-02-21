import { useState, useEffect } from 'react';
import { healthApi } from '../api/healthScores.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T, hDims, hDimKeys } from '../theme.js';

export default function HealthScoreModal({ open, onClose, onSaved, accountId, latestHealth }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (latestHealth) {
      const init = {};
      hDims.forEach(d => { init[hDimKeys[d]] = latestHealth[hDimKeys[d]] || 50; });
      setForm(init);
    } else {
      const init = {};
      hDims.forEach(d => { init[hDimKeys[d]] = 50; });
      setForm(init);
    }
    setError('');
  }, [latestHealth, open]);

  const handleSave = async () => {
    try {
      await healthApi.create(accountId, form);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Account Health Score">
      <p style={{ fontSize: 12, color: T.textS, marginBottom: 16 }}>Rate each dimension from 0-100 based on your assessment.</p>
      {hDims.map(d => {
        const key = hDimKeys[d];
        return (
          <div key={d} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: T.text, fontWeight: 500 }}>{d}</span>
              <span style={{ color: T.accent, fontWeight: 600 }}>{form[key] || 0}%</span>
            </div>
            <input type="range" min={0} max={100} value={form[key] || 0}
              onChange={e => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: T.accent }} />
          </div>
        );
      })}
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Health Score</Btn>
      </div>
    </Modal>
  );
}
