import { T } from '../../theme.js';
import { Card } from './Card.jsx';

export function StatBox({ icon, label, value, sub, color = T.accent }) {
  return (
    <Card style={{ textAlign: "center", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{value}</div>
      <div style={{ fontSize: 10, color: T.textS, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}
