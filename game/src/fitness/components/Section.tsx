import type { ReactNode } from 'react';
import { BRAND } from '../data';
import type { Tokens } from '../types';

type Props = {
  title: string;
  action?: string;
  children: ReactNode;
  t: Tokens;
};

export function Section({ title, action, children, t }: Props) {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: t.text, letterSpacing: '-0.2px' }}>{title}</div>
        {action && <div style={{ fontSize: '12px', color: BRAND, fontWeight: 600 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}
