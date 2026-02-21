import { T } from '../../theme.js';
import { Btn } from './Btn.jsx';

export function EmptyState({ icon, message, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: 48, color: T.textS }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, marginBottom: 16 }}>{message}</div>
      {action && <Btn onClick={onAction}>{action}</Btn>}
    </div>
  );
}
