import { COLORS } from './data';

export function Avatar({ emoji, img, size = 32 }: { emoji?: string; img?: string | null; size?: number }) {
  const innerSize = size - 4;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: COLORS.igGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {img ? (
          <img
            src={img}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <span style={{ fontSize: innerSize * 0.55 }}>{emoji}</span>
        )}
      </div>
    </div>
  );
}
