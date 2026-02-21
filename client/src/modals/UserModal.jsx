import { useState, useEffect } from 'react';
import { usersApi } from '../api/users.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { T } from '../theme.js';

const SCREENS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'surveys', label: 'Surveys & CSAT' },
  { key: 'reports', label: 'Reports' },
];

export default function UserModal({ open, onClose, onSaved, user }) {
  const isEdit = !!user;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], password: '' });
    } else {
      setForm({ name: '', email: '', password: '', role: 'csm', permissions: ['dashboard', 'accounts', 'surveys', 'reports'] });
    }
    setError('');
  }, [user, open]);

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const togglePerm = (key) => {
    setForm(prev => {
      const perms = prev.permissions || [];
      return { ...prev, permissions: perms.includes(key) ? perms.filter(p => p !== key) : [...perms, key] };
    });
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) delete payload.email;
      if (isEdit) await usersApi.update(user.id, payload);
      else await usersApi.create(payload);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit User" : "Add New User"}>
      {!isEdit && <Input label="Email" value={form.email || ''} onChange={v => setF('email', v)} type="email" placeholder="user@company.com" />}
      {isEdit && <div style={{ fontSize: 12, color: T.textS, marginBottom: 12 }}>Email: <span style={{ color: T.text }}>{user.email}</span></div>}
      <Input label="Full Name" value={form.name || ''} onChange={v => setF('name', v)} placeholder="John Doe" />
      <div style={{ position: 'relative' }}>
        <Input label={isEdit ? "New Password (leave blank to keep)" : "Password"} value={form.password || ''} onChange={v => setF('password', v)} type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" />
        <button type="button" onClick={() => setShowPwd(p => !p)}
          style={{ position: 'absolute', right: 10, top: 26, background: 'none', border: 'none', color: T.textS, cursor: 'pointer', fontSize: 13, padding: '4px 6px' }}>
          {showPwd ? 'Hide' : 'Show'}
        </button>
      </div>
      <Input label="Role" value={form.role || 'csm'} onChange={v => setF('role', v)} options={["admin", "manager", "csm", "viewer"]} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: T.textS, marginBottom: 6, fontWeight: 500 }}>Screen Permissions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SCREENS.map(s => {
            const active = (form.permissions || []).includes(s.key);
            return (
              <button key={s.key} type="button" onClick={() => togglePerm(s.key)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${active ? T.accent : T.border}`,
                  background: active ? T.accent + '20' : 'transparent',
                  color: active ? T.accent : T.textS,
                  transition: 'all .2s',
                }}>
                {active ? '\u2713 ' : ''}{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 8, padding: '8px 12px', background: T.err + '15', borderRadius: 8 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add User'}</Btn>
      </div>
    </Modal>
  );
}
