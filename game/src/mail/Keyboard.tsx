import { useState } from 'react';
import { Delete, Space } from 'lucide-react';
import { ym } from './styles';

const ROW_1 = ['q','w','e','r','t','z','u','i','o','p','ü'];
const ROW_2 = ['a','s','d','f','g','h','j','k','l','ö','ä'];
const ROW_3 = ['y','x','c','v','b','n','m'];

const SHIFT_1 = ['Q','W','E','R','T','Z','U','I','O','P','Ü'];
const SHIFT_2 = ['A','S','D','F','G','H','J','K','L','Ö','Ä'];
const SHIFT_3 = ['Y','X','C','V','B','N','M'];

type Props = {
  onKey: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
  onSpecial?: (key: string) => void;
  specialLabel?: string;
  rightLabel?: string;
  onRight?: () => void;
  rightIsPrimary?: boolean;
};

const Key = ({
  label, onPress, flex = 1, isPrimary = false,
}: {
  label: React.ReactNode;
  onPress: () => void;
  flex?: number;
  isPrimary?: boolean;
}) => (
  <button
    type="button"
    onClick={onPress}
    style={{
      flex,
      height: 44,
      margin: 3,
      borderRadius: 8,
      border: 'none',
      backgroundColor: isPrimary ? ym.blue : ym.surface,
      color: isPrimary ? ym.white : ym.text,
      fontSize: 17,
      fontWeight: 500,
      cursor: 'pointer',
      boxShadow: `0 1px 0 ${ym.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitTapHighlightColor: 'transparent',
    }}
  >
    {label}
  </button>
);

export default function Keyboard({
  onKey, onBackspace, onSpace, onEnter, onSpecial, specialLabel, rightLabel, onRight, rightIsPrimary,
}: Props) {
  const [shift, setShift] = useState(false);
  const [caps, setCaps] = useState(false);

  const tap = (k: string) => {
    onKey(shift ? k.toUpperCase() : k);
    if (shift && !caps) setShift(false);
  };

  const pressShift = () => {
    if (caps) { setCaps(false); setShift(false); }
    else if (shift) { setCaps(true); setShift(false); }
    else setShift(true);
  };

  const row1 = shift ? SHIFT_1 : ROW_1;
  const row2 = shift ? SHIFT_2 : ROW_2;
  const row3 = shift ? SHIFT_3 : ROW_3;

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{
        backgroundColor: '#D0D3D8',
        padding: '4px 4px 8px',
        borderTop: '1px solid #B0B3B8',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex' }}>
        {row1.map(k => <Key key={k} label={k} onPress={() => tap(k)} />)}
      </div>
      <div style={{ display: 'flex', paddingLeft: 14, paddingRight: 14 }}>
        {row2.map(k => <Key key={k} label={k} onPress={() => tap(k)} />)}
      </div>
      <div style={{ display: 'flex' }}>
        <Key
          label={<span style={{ fontSize: 14, fontWeight: 700 }}>{caps ? 'CAPS' : '⇧'}</span>}
          onPress={pressShift}
          flex={1.3}
        />
        {row3.map(k => <Key key={k} label={k} onPress={() => tap(k)} />)}
        <Key label={<Delete size={18} />} onPress={onBackspace} flex={1.3} />
      </div>
      <div style={{ display: 'flex' }}>
        {onSpecial && (
          <Key label={<span style={{ fontSize: 14 }}>{specialLabel ?? '?123'}</span>} onPress={() => onSpecial('?')} flex={1.3} />
        )}
        <Key label={<Space size={16} />} onPress={onSpace} flex={5} />
        <Key label={<span style={{ fontSize: 14 }}>↵</span>} onPress={onEnter} flex={1.3} />
        {onRight && (
          <Key
            label={<span style={{ fontSize: 14, fontWeight: 600 }}>{rightLabel ?? '→'}</span>}
            onPress={onRight}
            flex={1.3}
            isPrimary={rightIsPrimary}
          />
        )}
      </div>
    </div>
  );
}
