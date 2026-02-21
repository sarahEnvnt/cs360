import { useState } from 'react';
import { T } from '../theme.js';
import { useApi } from '../hooks/useApi.js';
import { usersApi } from '../api/users.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import UserModal from '../modals/UserModal.jsx';

const roleColors = { admin: '#EF6461', manager: '#A78BFA', csm: '#C9A227', viewer: '#6B7A94' };

export default function UserManagementPage() {
  const { data: users, refresh } = useApi(() => usersApi.list(), []);
  const [modal, setModal] = useState(null);

  const handleSaved = () => { setModal(null); refresh(); };

  const handleToggleActive = async (u) => {
    if (!confirm(`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}?`)) return;
    await usersApi.update(u.id, { isActive: !u.isActive });
    refresh();
  };

  const handleDelete = async (u) => {
    if (!confirm(`Permanently delete ${u.name}? This cannot be undone.`)) return;
    await usersApi.remove(u.id);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: T.textS }}>{users?.length || 0} user(s)</div>
        <Btn onClick={() => setModal('add')}>+ Add User</Btn>
      </div>

      {!users || users.length === 0 ? (
        <EmptyState icon="👥" message="No users found." action="+ Add User" onAction={() => setModal('add')} />
      ) : (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2.5fr 1fr 2fr', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.textS, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <span>Name</span><span>Email</span><span>Role</span><span>Permissions</span><span>Status</span><span>Actions</span>
          </div>
          {users.map(u => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2.5fr 1fr 2fr', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${T.border}`, alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: T.text, fontWeight: 500 }}>{u.name}</span>
              <span style={{ color: T.textS, fontSize: 12 }}>{u.email}</span>
              <Badge color={roleColors[u.role] || T.textS}>{u.role}</Badge>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(u.permissions || []).filter(p => p !== 'users').map(p => (
                  <Badge key={p} color={T.info}>{p}</Badge>
                ))}
              </div>
              <Badge color={u.isActive ? T.ok : T.err}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="ghost" onClick={() => setModal(u)}>Edit</Btn>
                <Btn variant="ghost" onClick={() => handleToggleActive(u)}>
                  {u.isActive ? 'Disable' : 'Enable'}
                </Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      <UserModal open={modal !== null} onClose={() => setModal(null)} onSaved={handleSaved} user={typeof modal === 'object' ? modal : undefined} />
    </div>
  );
}
