import { useState, useEffect } from 'react';
import { responsesApi } from '../api/surveyResponses.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

export default function SurveyResponseModal({ open, onClose, onSaved, accountId, response }) {
  const isEdit = !!response;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(response ? { ...response } : {});
    setError('');
  }, [response, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      const data = {
        ...form,
        csat: form.csat !== "" && form.csat != null ? Number(form.csat) : null,
        nps: form.nps !== "" && form.nps != null ? Number(form.nps) : null,
      };
      if (isEdit) await responsesApi.update(accountId, response.id, data);
      else await responsesApi.create(accountId, data);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Survey Response" : "Record Survey Response"}>
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
      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>{isEdit ? "Save Changes" : "Record Response"}</Btn>
      </div>
    </Modal>
  );
}
