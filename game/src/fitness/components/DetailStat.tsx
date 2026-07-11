import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export function DetailStat({ icon: Icon, value, label }: Props) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '12px 8px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Icon size={16} color="white" style={{ marginBottom: '4px' }} />
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}
