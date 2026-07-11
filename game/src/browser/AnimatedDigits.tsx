import { useState, useEffect, useRef, useMemo } from 'react';

export const digitFlipCss = `@keyframes digit-flip {
  0%   { transform: translateY(-70%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}`;

type SlotStyle = {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number | string;
};

function CharSlot({ char, style }: { char: string; style: SlotStyle }) {
  const [animating, setAnimating] = useState(false);
  const prev = useRef(char);

  useEffect(() => {
    if (prev.current === char) return;
    prev.current = char;
    setAnimating(true);
    const t = window.setTimeout(() => setAnimating(false), 280);
    return () => window.clearTimeout(t);
  }, [char]);

  const isColon = char === ':';
  return (
    <span
      style={{
        display: 'inline-block',
        minWidth: isColon ? '0.32em' : '0.6em',
        textAlign: 'center',
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        fontVariantNumeric: 'tabular-nums',
        animation: animating ? 'digit-flip 0.26s ease-out' : 'none',
      }}
    >
      {char}
    </span>
  );
}

export function AnimatedTime({ value, style }: { value: string; style: SlotStyle }) {
  const chars = useMemo(() => value.split(''), [value]);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      {chars.map((char, i) => (
        <CharSlot key={i} char={char} style={style} />
      ))}
    </span>
  );
}
