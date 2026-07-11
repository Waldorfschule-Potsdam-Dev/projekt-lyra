import React, { forwardRef } from 'react';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import '@fontsource/orbitron/900.css';

interface ShareCardProps {
  type: 'success' | 'alt';
  playtime?: string;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ type, playtime }, ref) => {
    const isSuccess = type === 'success';

    return (
      <div
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          // We render it at exactly 1080x1080 for a high-quality square share image
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: '"Inter", sans-serif',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div ref={ref} style={{
          width: 1080,
          height: 1080,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08080d',
          backgroundImage: 'radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.4), transparent 60%), radial-gradient(ellipse at bottom right, rgba(107, 33, 168, 0.3), transparent 60%)',
          color: '#f4f4f5',
          padding: 80,
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          


          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: 200, height: 200, borderRadius: '50%', 
              backgroundColor: isSuccess ? 'rgba(168, 85, 247, 0.15)' : 'rgba(248, 113, 113, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 60,
              boxShadow: isSuccess ? '0 0 80px rgba(168, 85, 247, 0.4)' : '0 0 80px rgba(248, 113, 113, 0.4)'
            }}>
              {isSuccess ? <ShieldCheck size={100} color="#c084fc" strokeWidth={1.5} /> : <ShieldAlert size={100} color="#F87171" strokeWidth={1.5} />}
            </div>

            <div style={{ fontSize: 42, fontWeight: 600, color: '#9aa0a6', letterSpacing: 8, textTransform: 'uppercase', marginBottom: 24 }}>
              Operation NORDLICHT
            </div>

            <h1 style={{ 
              fontFamily: '"Orbitron", monospace', 
              fontSize: 96, 
              fontWeight: 900, 
              margin: '0 0 24px', 
              letterSpacing: -2,
              textTransform: 'uppercase',
              textShadow: '0 0 40px rgba(168, 85, 247, 0.6)'
            }}>
              Projekt <span style={{ color: '#c084fc' }}>Lyra</span>
            </h1>

            <div style={{ width: 120, height: 4, backgroundColor: isSuccess ? '#c084fc' : '#F87171', margin: '40px 0', borderRadius: 4 }} />

            <h2 style={{ fontSize: 56, fontWeight: 500, margin: '0 0 40px', color: '#e3e3e3' }}>
              {isSuccess ? 'Whistleblower-Dossier geleakt.' : 'Die Wahrheit bleibt verborgen.'}
            </h2>

            {playtime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: '24px 48px', borderRadius: 100, marginTop: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Clock size={40} color="#9aa0a6" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 20, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, marginBottom: 4 }}>Spielzeit</div>
                  <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>{playtime}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: '#6b7280', fontWeight: 500, letterSpacing: 2 }}>
            projekt-lyra.de
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
