import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Award,
  ChevronRight,
  Flame,
  Heart,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { BRAND, BRAND_LIGHT, STORAGE_KEY_THEME } from '../data';
import { buildTokens } from '../styles';
import type { Theme } from '../types';
import { PillStat } from '../components/PillStat';
import { Section } from '../components/Section';

import { TopBar } from '../components/TopBar';
import { CollectClueButton } from '../../components/CollectClueButton';

const ROWS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: TrendingUp, label: 'Gewicht', value: '82 kg' },
  { icon: Activity, label: 'Größe', value: '186 cm' },
  { icon: Target, label: 'Ziel', value: 'Muskelaufbau' },
  { icon: Award, label: 'Bestleistung', value: 'Push 90 kg' },
  { icon: Heart, label: 'Blutgruppe', value: 'A Rh negativ' },
  { icon: Award, label: 'Geburtsdatum', value: '17. März 1989' },
];

const BADGES: { icon: LucideIcon; label: string; grad: [string, string] }[] = [
  { icon: Flame, label: '7 Tage', grad: ['#FF6F00', '#FFA726'] },
  { icon: Heart, label: '10 Workouts', grad: ['#E91E63', '#F06292'] },
  { icon: Award, label: 'Top 10%', grad: ['#7E57C2', '#B39DDB'] },
];

export default function Profile() {
  const theme: Theme = 'dark';
  const t = useMemo(() => buildTokens(theme), [theme]);

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <TopBar subtitle="Konto" title="Profil" t={t} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: '8px',
          borderRadius: '32px',
          padding: '24px',
          textAlign: 'center',
          color: 'white',
          background: `linear-gradient(135deg, #1a1a1f 0%, #2a1a14 60%, ${BRAND} 130%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: t.shadowHero,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_LIGHT}55 0%, transparent 70%)`,
          }}
        />
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              margin: '0 auto',
              background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
              color: 'white',
              fontSize: '36px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 12px 30px ${BRAND}66`,
              border: '4px solid rgba(255,255,255,0.15)',
            }}
>
              D
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '14px', letterSpacing: '-0.4px' }}>Daniel Seidt</div>
          <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '2px' }}>Mitglied seit März 2024</div>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '22px' }}>
            <PillStat n="42" l="Workouts" />
            <PillStat n="18 320" l="kcal" />
            <PillStat n="7" l="Streak" highlight />
          </div>
        </div>
      </motion.div>

      <Section title="Einstellungen" t={t}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: t.card,
            borderRadius: '22px',
            overflow: 'hidden',
            boxShadow: t.shadow,
            border: `1px solid ${t.cardBorder}`,
          }}
        >

          {ROWS.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderTop: `1px solid ${t.divider}`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${BRAND}22, ${BRAND_LIGHT}11)`,
                    color: BRAND,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, fontSize: '14px', color: t.text, fontWeight: 500 }}>{r.label}</div>
                <div style={{ fontSize: '14px', color: t.textSoft, fontWeight: 600 }}>{r.value}</div>
                
                {r.label === 'Blutgruppe' ? (
                  <CollectClueButton clueId="fitness:bloodtype" size={16} />
                ) : (
                  <ChevronRight size={18} color={t.chevron} />
                )}
              </div>
            );
          })}
        </motion.div>
      </Section>

      <Section title="Erfolge" t={t}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: 1,
                  backgroundColor: t.card,
                  borderRadius: '20px',
                  padding: '14px 10px',
                  textAlign: 'center',
                  boxShadow: t.shadow,
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    margin: '0 auto 8px',
                    background: `linear-gradient(135deg, ${b.grad[0]}, ${b.grad[1]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 16px ${b.grad[0]}55`,
                  }}
                >
                  <Icon size={20} color="white" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: t.text }}>{b.label}</div>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
