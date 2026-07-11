import { MapPin } from 'lucide-react';

export default function Nordlicht() {
  return (
    <div style={{
      backgroundColor: '#525659',
      padding: '24px 16px',
      minHeight: '100%',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#2b2b2b',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        position: 'relative',
        minHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header Ribbon */}
        <div style={{
          backgroundColor: '#cc0000',
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '11px',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          VS – Vertraulich
        </div>

        <div style={{ padding: '40px 48px', flex: 1 }}>
          {/* Letterhead */}
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '20px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ministerium für Innere Kohärenz
            </h1>
            <h2 style={{ fontSize: '14px', fontWeight: 'normal', color: '#555', margin: '0 0 16px 0' }}>
              Abteilung Strategische Koordinierung
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <div><strong>Projektakte:</strong> NORDLICHT</div>
              <div><strong>Aktenzeichen:</strong> MIK-KL-2026-071-NL</div>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '32px', letterSpacing: '2px' }}>
            PROJEKT NORDLICHT
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px', marginBottom: '32px' }}>
            <div style={{ fontWeight: 'bold' }}>Codename:</div><div>NORDLICHT</div>
            <div style={{ fontWeight: 'bold' }}>Status:</div><div>Laufend</div>
            <div style={{ fontWeight: 'bold' }}>Projektbeginn:</div><div>08.01.2026</div>
            <div style={{ fontWeight: 'bold' }}>Projektleitung:</div><div>Referat Klima- und Infrastrukturresilienz</div>
            <div style={{ fontWeight: 'bold' }}>Priorität:</div><div>II</div>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            1. KURZBESCHREIBUNG
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            Projekt <strong>NORDLICHT</strong> untersucht die Auswirkungen klimatischer Veränderungen auf kritische Infrastrukturen sowie staatliche Vorsorge- und Krisenmechanismen. Im Fokus stehen insbesondere arktische Klimadynamiken und deren Einfluss auf globale Wetter- und Versorgungssysteme.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            2. INTERNE SYSTEMHINWEISE (TESTMODUS)
          </h3>
          <div style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 16px', fontSize: '13px', marginBottom: '24px' }}>
            <strong>SYSTEMVERMERK KL-04/77</strong><br />
            Der Referenzmarker wurde an der maximal nördlich erreichbaren Kartenposition hinterlegt. Die Sichtbarkeit ist abhängig von Zoomstufe und Kartenmodus.
          </div>

          <div style={{ backgroundColor: '#e2e3e5', padding: '16px', borderRadius: '4px', fontSize: '13px', marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>TESTANWEISUNG (UI-SIMULATION)</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>Kartenanwendung öffnen</li>
              <li>Globale Ansicht aktivieren</li>
              <li>Navigation nach Norden bis zum äußersten Kartenrand</li>
              <li>Systemmarker „NORDLICHT-REF" suchen und bestätigen</li>
            </ol>
            <p style={{ marginTop: '12px', fontSize: '11px', color: '#666', fontStyle: 'italic', margin: '12px 0 0 0' }}>
              Hinweis: Der Marker dient ausschließlich als Funktions- und Rendering-Test innerhalb der Anwendung.
            </p>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            3. ZEITPLAN
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '32px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Phase</th>
                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Zeitraum</th>
                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Projektstart</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Jan 2026</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>✓</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Datenerhebung</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Feb–Apr 2026</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>✓</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Kartensystem</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Sep 2026</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>In Entwicklung</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #ccc',
          padding: '12px 48px',
          fontSize: '10px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
          marginTop: 'auto',
        }}>
          <div>MIK-KL-2026-071-NL</div>
          <div>Stand 11.06.2026 · v2.2</div>
          <div>Seite 1 von 1</div>
        </div>
      </div>
    </div>
  );
}
