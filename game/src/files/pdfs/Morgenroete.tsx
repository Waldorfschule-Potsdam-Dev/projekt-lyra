import { Lock } from 'lucide-react';

export default function Morgenroete() {
  return (
    <div style={{
      backgroundColor: '#525659',
      padding: '24px 16px',
      minHeight: '100%',
      fontFamily: '"Times New Roman", Times, serif',
      color: '#111',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fbfbfb',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        position: 'relative',
        minHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header Ribbon */}
        <div style={{
          backgroundColor: '#333',
          color: '#fff',
          padding: '10px 16px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          fontSize: '12px',
          textAlign: 'center',
          textTransform: 'uppercase',
          borderBottom: '4px solid #cc0000',
        }}>
          <Lock size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
          VS – Vertraulich
        </div>

        <div style={{ padding: '40px 48px', flex: 1 }}>
          {/* Letterhead */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '22px', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #ccc', paddingBottom: '12px' }}>
              Ministerium für Innere Kohärenz
            </h1>
            <h2 style={{ fontSize: '15px', fontWeight: 'normal', color: '#444', margin: '0' }}>
              Abteilung Strategische Koordinierung
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '32px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
            <div><strong>Aktenzeichen:</strong> MIK-SK-26/0417-VS</div>
            <div><strong>Datum:</strong> 03.02.2026</div>
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '32px', borderLeft: '4px solid #cc0000', paddingLeft: '12px' }}>
            OPERATION »MORGENRÖTE«
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px', fontSize: '14px', marginBottom: '40px', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 'bold' }}>Codename:</div><div>MORGENRÖTE</div>
            <div style={{ fontWeight: 'bold' }}>Status:</div><div>Aktiv</div>
            <div style={{ fontWeight: 'bold' }}>Priorität:</div><div style={{ color: '#cc0000', fontWeight: 'bold' }}>Alpha</div>
            <div style={{ fontWeight: 'bold' }}>Leitende Dienststelle:</div><div>Abteilung Strategische Koordinierung</div>
            <div style={{ fontWeight: 'bold' }}>Projektbeginn:</div><div>03.02.2026</div>
          </div>

          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            1. ZIELSETZUNG
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
            Operation »MORGENRÖTE« dient der ressortübergreifenden Erprobung eines neuen Krisen- und Verwaltungsmanagements für den Fall außergewöhnlicher gesellschaftlicher Belastungslagen. Im Mittelpunkt stehen die Optimierung der Behördenkommunikation, Beschleunigung administrativer Entscheidungsprozesse sowie die Vereinheitlichung interner Meldewege.
          </p>

          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            2. INTERNE KENNUNGEN
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '40px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#eaeaea', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Codename</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>ARES</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Verwaltung</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>ARGUS</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Informationssysteme</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>ATLAS</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Lagezentrum</td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: '2px dashed #cc0000', padding: '20px', textAlign: 'center', backgroundColor: '#fff5f5' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#cc0000', fontSize: '14px', textTransform: 'uppercase' }}>Streng Vertraulich</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
              Diese Unterlage ist ausschließlich für den internen Dienstgebrauch bestimmt. Eine Weitergabe außerhalb des festgelegten Empfängerkreises bedarf der vorherigen Genehmigung der Projektleitung.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #ccc',
          padding: '16px 48px',
          fontSize: '11px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#eee',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          marginTop: 'auto',
        }}>
          <div>MIK-SK-26/0417-VS</div>
          <div>Stand 18.06.2026 · v2.4</div>
          <div style={{ fontFamily: 'monospace' }}>Prüfsumme: 6B-A8-91-CC</div>
        </div>
      </div>
    </div>
  );
}
