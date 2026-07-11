export function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
  autoCapitalize?: 'words' | 'none' | 'sentences';
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#5f6368', letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={keyboardType === 'numeric' ? 'numeric' : undefined}
        autoCapitalize={autoCapitalize}
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          border: '1px solid #dadce0',
          backgroundColor: '#fff',
          fontSize: 15,
          color: '#202124',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </label>
  );
}
