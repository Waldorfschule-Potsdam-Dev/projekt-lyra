import { CreditCard as CreditCardIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  type Card, CARD_PALETTES, paletteFor, formatNumber, getStableBankNumber 
} from '../data';

export function CreditCardSurface({
  palette,
  bank,
  brand,
  number,
  holder,
}: {
  palette: { from: string; mid: string; to: string };
  bank: string;
  brand: string;
  number: string;
  holder: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 340,
        aspectRatio: '1.586',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.mid} 55%, ${palette.to} 100%)`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)',
        color: '#fff',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -30,
          left: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.2, opacity: 0.95 }}>
            {bank}
          </div>
          <div
            style={{
              fontSize: 18,
              fontStyle: 'italic',
              fontWeight: 700,
              letterSpacing: 1,
              opacity: 0.95,
            }}
          >
            {brand}
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 32,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #f5d57a 0%, #d4a64a 50%, #a07a2a 100%)',
            position: 'relative',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 6,
              right: 6,
              height: 1,
              background: 'rgba(0,0,0,0.25)',
            }}
          />
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(number.replace(/\s/g, ''));
            toast.success('Kartennummer kopiert', { style: { background: '#333', color: '#fff' }});
          }}
          style={{
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: 4,
            fontFamily: "'Courier New', ui-monospace, SFMono-Regular, monospace",
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'copy',
            userSelect: 'all',
          }}
          title="Kartennummer kopieren"
        >
          {number}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: 0.8, marginBottom: 2 }}>
              KARTENINHABER
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {holder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoCreditCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Demo-Kreditkarte"
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
        maxWidth: 340,
      }}
    >
      <CreditCardSurface
        palette={CARD_PALETTES[0]}
        bank="ESCAPE BANK"
        brand="GLOBALCARD"
        number={getStableBankNumber()}
        holder="Daniel Seidt"
      />
    </button>
  );
}

export function SavedCreditCard({ card }: { card: Card }) {
  const palette = paletteFor(card.id);
  const upperName = card.name.toUpperCase();
  const upperHolder = card.holder.toUpperCase();
  const brand = /master/i.test(card.name) ? 'SUPERCARD' : 'GLOBALCARD';
  return (
    <CreditCardSurface
      palette={palette}
      bank={upperName}
      brand={brand}
      number={formatNumber(card.number) || '•••• •••• •••• ••••'}
      holder={upperHolder || '—'}
    />
  );
}
