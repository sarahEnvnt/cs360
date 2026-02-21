import { useState } from 'react';
import { T } from '../../theme.js';

export function Card({ children, style, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)} onClick={onClick}
      style={{ background: h ? T.cardH : T.card, border: `1px solid ${h ? T.accent + "33" : T.border}`, borderRadius: 14, padding: 20, transition: "all .2s", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}
