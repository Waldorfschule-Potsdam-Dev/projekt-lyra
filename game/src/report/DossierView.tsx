import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertTriangle, Shield, CheckCircle2, ChevronRight, Lock, Star, Search } from 'lucide-react';
import { useClueStore, CATEGORY_LABELS, COMPLETION_REQUIREMENTS, CLUE_REGISTRY } from '../store/clues';

type Props = { onSubmitted: () => void };

const APP_NAMES: Record<string, string> = {
  wazaaah: 'Wazaaah', musica: 'MusiCa', mail: 'YMail', lumigram: 'Lumigram',
  browser: 'Browser', calendar: 'Kalender', clock: 'Uhr', files: 'Dateien',
  fitness: 'Fitness', maps: 'Maps', messages: 'Nachrichten', notes: 'Notizen',
  photos: 'Fotos', settings: 'Einstellungen', wallet: 'Wallet', report: 'Report'
};

function ClueItem({ clue, isFirst }: { clue: any, isFirst: boolean }) {
  if (clue.isFound) {
    return (
      <div style={{ marginTop: isFirst ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{clue.template.title}</div>
          <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', color: '#9aa0a6', textTransform: 'uppercase' }}>
            {CATEGORY_LABELS[clue.template.category as keyof typeof CATEGORY_LABELS]}
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#9aa0a6', lineHeight: 1.4 }}>{clue.data.content}</div>
      </div>
    );
  } else {
    const appName = APP_NAMES[clue.template.sourceApp] || clue.template.sourceApp;
    return (
      <div style={{ marginTop: isFirst ? 12 : 0, opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Lock size={14} color="#9aa0a6" />
          <div style={{ fontSize: 15, fontWeight: 500, color: '#9aa0a6' }}>Verschlüsselte Daten</div>
          <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280', textTransform: 'uppercase' }}>
            {CATEGORY_LABELS[clue.template.category as keyof typeof CATEGORY_LABELS]}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={12} />
          Unbekannte Spur in der App "{appName}".
        </div>
      </div>
    );
  }
}

export default function DossierView({ onSubmitted }: Props) {
  const navigate = useNavigate();
  const clues = useClueStore(s => s.clues);
  
  const allClues = Object.entries(CLUE_REGISTRY)
    .filter(([_, template]) => template.category !== 'games')
    .map(([id, template]) => ({
      id,
      template,
      isFound: !!clues[id],
      isRequired: COMPLETION_REQUIREMENTS.requiredClues.includes(id),
      data: clues[id]
    }));

  const foundClues = allClues.filter(c => c.isFound);
  const requiredClues = allClues.filter(c => c.isRequired);
  const additionalClues = allClues.filter(c => !c.isRequired);

  let hasMetRequirements = foundClues.length >= COMPLETION_REQUIREMENTS.minClues &&
    requiredClues.every(c => c.isFound);

  if (import.meta.env.DEV) {
    hasMetRequirements = true;
  }

  const missingMandatory = requiredClues.filter(c => !c.isFound).length;
  // Also only count the non-game found clues here for the display logic:
  const actualFoundCount = foundClues.length;

  return (
    <div style={{ flex: 1, backgroundColor: '#0e0f12', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ padding: '40px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#0e0f12', borderBottom: '1px solid #1c1d22', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e3e3e3' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#9aa0a6', letterSpacing: 0.4 }}>KONTEXT • Whistleblower</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#e3e3e3' }}>Dossier Entwurf</div>
        </div>
        <Shield size={22} color="#0B8043" />
      </header>

      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="hide-scrollbar">
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500 }}>Beweismittel-Akte</h2>
              <p style={{ margin: 0, fontSize: 15, color: '#9aa0a6', lineHeight: 1.5 }}>
                Sammle alle erforderlichen Informationen, um das Dossier zu vervollständigen.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Essenzielle Hauptbeweise */}
              <div style={{ backgroundColor: '#1c1d22', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Star size={20} color="#a8c7fa" fill="#a8c7fa" />
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#e3e3e3' }}>Essenzielle Hauptbeweise</span>
                  <span style={{ marginLeft: 'auto', fontSize: 14, color: '#a8c7fa', fontWeight: 500 }}>{requiredClues.filter(c => c.isFound).length} / {requiredClues.length}</span>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {missingMandatory > 0 && (
                    <div style={{ padding: '16px', backgroundColor: '#370b0e', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                      <AlertTriangle size={20} color="#ffb4ab" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: 14, color: '#ffb4ab', lineHeight: 1.4 }}>
                        Um das Dossier abzuschließen, musst du alle essenziellen Beweise finden.
                      </div>
                    </div>
                  )}
                  {requiredClues.map((clue, idx) => (
                    <ClueItem key={clue.id} clue={clue} isFirst={idx === 0 && missingMandatory === 0} />
                  ))}
                </div>
              </div>

              {/* Zusätzliche Indizien */}
              <div style={{ backgroundColor: '#1c1d22', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle2 size={20} color="#c4c7c5" />
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#e3e3e3' }}>Weitere Indizien</span>
                  <span style={{ marginLeft: 'auto', fontSize: 14, color: '#c4c7c5', fontWeight: 500 }}>{additionalClues.filter(c => c.isFound).length} / {additionalClues.length}</span>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {additionalClues.map((clue, idx) => (
                    <ClueItem key={clue.id} clue={clue} isFirst={idx === 0} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: 20, backgroundColor: hasMetRequirements ? '#0f5223' : '#370b0e', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {hasMetRequirements ? <CheckCircle2 size={24} color="#c4eed0" style={{ flexShrink: 0 }} /> : <AlertTriangle size={24} color="#ffb4ab" style={{ flexShrink: 0 }} />}
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 500, color: hasMetRequirements ? '#c4eed0' : '#ffb4ab' }}>
                    {hasMetRequirements ? 'Dossier vollständig' : 'Dossier unvollständig'}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: hasMetRequirements ? '#c4eed0' : '#ffb4ab', opacity: 0.9, lineHeight: 1.4 }}>
                    {hasMetRequirements 
                      ? 'Du hast genügend belastende Beweise gesammelt. Die Redaktion kann damit arbeiten.' 
                      : `Du hast ${actualFoundCount} von mindestens ${COMPLETION_REQUIREMENTS.minClues} Hinweisen gefunden. ${missingMandatory > 0 ? `Es fehlen noch ${missingMandatory} essenzielle Beweise.` : 'Suche weiter.'}`}
                  </p>
                </div>
              </div>
            </div>
          </>
      </div>

      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid #1c1d22', backgroundColor: '#0e0f12', flexShrink: 0 }}>
        <button
          onClick={onSubmitted}
          disabled={!hasMetRequirements}
          style={{
            width: '100%', padding: '14px 18px', backgroundColor: hasMetRequirements ? '#0B8043' : '#3c4043',
            color: hasMetRequirements ? '#fff' : '#9aa0a6', border: 'none', borderRadius: 24, fontSize: 15,
            fontWeight: 500, cursor: hasMetRequirements ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {hasMetRequirements ? <Check size={18} /> : <Shield size={18} />}
          Bericht absenden
        </button>
      </div>
    </div>
  );
}
