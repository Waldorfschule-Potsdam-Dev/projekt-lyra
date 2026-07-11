import React from 'react';
import { motion } from 'framer-motion';
import { useClueStore } from '../store/clues';
import { Search, Check } from 'lucide-react';

interface CollectClueButtonProps {
  clueId: string;
  className?: string;
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
  silent?: boolean;
}

// Four sparkle dots that shoot out and fade
function Sparkles({ size }: { size: number }) {
  const sparks = [
    { angle: 45,  delay: 0 },
    { angle: 135, delay: 0.1 },
    { angle: 225, delay: 0.05 },
    { angle: 315, delay: 0.15 },
    { angle: 0,   delay: 0.2 },
    { angle: 90,  delay: 0 },
    { angle: 180, delay: 0.1 },
    { angle: 270, delay: 0.05 },
  ];
  const r = size * 2.8; // radius of orbit

  return (
    <>
      {sparks.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * r;
        const ty = Math.sin(rad) * r;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 === 0 ? 4 : 3,
              height: i % 2 === 0 ? 4 : 3,
              borderRadius: '50%',
              backgroundColor: i % 3 === 0 ? '#86efac' : i % 3 === 1 ? '#4ade80' : '#d9f99d',
              top: '50%',
              left: '50%',
              marginTop: i % 2 === 0 ? -2 : -1.5,
              marginLeft: i % 2 === 0 ? -2 : -1.5,
              pointerEvents: 'none',
            }}
            animate={{
              x: [0, tx * 0.6, tx],
              y: [0, ty * 0.6, ty],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0],
            }}
            transition={{
              duration: 1.8,
              delay: s.delay,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </>
  );
}

export function CollectClueButton({ clueId, className = "", size = 18, onClick, silent = false }: CollectClueButtonProps) {
  const { clues, discoverClue } = useClueStore();
  const isCollected = !!clues[clueId];

  if (isCollected) {
    return (
      <div
        onClick={onClick}
        className={className}
        style={{
          width: size * 2.2,
          height: size * 2.2,
          backgroundColor: 'rgba(11, 128, 67, 0.12)',
          color: '#0B8043',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
        }}
        title="Gesichert"
      >
        <Check size={size} strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        discoverClue(clueId, silent);

        if (typeof window !== 'undefined' && (window as any).umami) {
          const startTime = localStorage.getItem('escape_start_time') || Date.now().toString();
          const minutesPlayed = Math.floor((Date.now() - parseInt(startTime)) / 60000);
          (window as any).umami.track('clue_found', { clueId, minutesPlayed });
        }

        if (onClick) {
          onClick(e as any);
        }
      }}
      className={className}
      style={{
        position: 'relative',
        width: size * 2.6,
        height: size * 2.6,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        color: 'white',
        background: 'linear-gradient(135deg, #0B8043 0%, #16a085 100%)',
        flexShrink: 0,
        overflow: 'visible',
      }}
      animate={{
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 0px 0px rgba(11,128,67,0), 0 2px 8px rgba(11,128,67,0.3)',
          '0 0 16px 5px rgba(74,222,128,0.4), 0 2px 8px rgba(11,128,67,0.4)',
          '0 0 0px 0px rgba(11,128,67,0), 0 2px 8px rgba(11,128,67,0.3)',
        ],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.9 }}
      title="Hinweis sichern"
    >
      <Sparkles size={size} />
      <Search size={size} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
    </motion.button>
  );
}
