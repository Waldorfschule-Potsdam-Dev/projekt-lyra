
export default function RechtlicheBewertungHydra() {
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
        <div style={{
          backgroundColor: '#2c3e50',
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '11px',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          Klassifikation: P-5 / Vertraulich
        </div>

        <div style={{ padding: '40px 48px', flex: 1 }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '20px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              RECHTLICHE BEWERTUNG – SYSTEM HYDRA
            </h1>
            <h2 style={{ fontSize: '14px', fontWeight: 'normal', color: '#555', margin: '0 0 16px 0' }}>
              Gutachten: Verfassungs- und Verwaltungsvereinbarkeit
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <div><strong>Herausgeber:</strong> PES – Abteilung Recht</div>
              <div><strong>Datum:</strong> 2026</div>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            1. AUFTRAG & GEGENSTAND
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            Prüfung der rechtlichen Bewertung des Systems <strong>HYDRA</strong> hinsichtlich Verwaltungsordnung, Datenarchitektur, Grundrechtseingriffen und Delegation hoheitlicher Entscheidungen an Algorithmen.
            HYDRA ist ein mehrschichtiges Integrationssystem zur Analyse, Prognose, Kommunikationskoordination und Unterstützung sicherheitsrelevanter Entscheidungen.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            2. RECHTLICHE EINORDNUNG
          </h3>
          <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderLeft: '4px solid #2c3e50', fontSize: '13px', marginBottom: '24px', fontStyle: 'italic' }}>
            HYDRA ist nach funktionaler Betrachtung ein „administratives Meta-Entscheidungssystem mit unterstützender Steuerungsfunktion“. Eine vollständige Delegation hoheitlicher Entscheidungen ist rechtlich nicht gedeckt, sofern keine menschliche Letztentscheidung, Transparenz und nachträgliche Kontrolle besteht.
          </div>
          
          <h4 style={{ fontSize: '13px', margin: '0 0 8px 0' }}>Grundrechtsrelevanz</h4>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
            Berührt werden Selbstbestimmung, Rechtsschutz, Gleichbehandlung und Privatsphäre. Kritisch wird es, wenn HYDRA eigenständige Entscheidungen faktisch determiniert.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            3. VERHÄLTNIS MENSCH/SYSTEM
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            Die Architektur führt zu einer „funktionalen Vorprägung administrativer Entscheidungen“: Politische Abwägung wird durch datenbasierte Vorstrukturierung ersetzt, Verwaltungshandlung durch Systemausführung.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            4. PRÜFUNG DER RECHTSSTAATLICHEN GRENZEN
          </h3>
          <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px', paddingLeft: '20px' }}>
            <li><strong>Transparenzgebot:</strong> Nachvollziehbarkeit eingeschränkt → Rechtlich kritisch.</li>
            <li><strong>Verantwortung:</strong> Diffuse Struktur. Risiko einer Entkopplung von Verantwortung und Entscheidung.</li>
            <li><strong>Kontrolle:</strong> Positiv bewertet werden modulare Struktur, redundante Datenvalidierung und nachgelagerte Analyseverfahren (Prisma/Atlas).</li>
          </ul>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            5. GESAMTRECHTLICHE BEWERTUNG
          </h3>
          <div style={{ fontSize: '13px', fontWeight: 'bold', border: '1px solid #d9534f', color: '#d9534f', padding: '12px', textAlign: 'center', marginBottom: '24px' }}>
            Zulässig im Rahmen eines unterstützenden Verwaltungssystems unter strikter menschlicher Letztkontrolle.
          </div>
          <p style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '24px' }}>
            Eine Autonomisierung wäre nur mit vollständiger Auditierbarkeit, klarer Delegation, jederzeitiger menschlicher Intervention und dokumentierter Haftung vertretbar.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            6. EMPFEHLUNG
          </h3>
          <ul style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '24px', paddingLeft: '20px' }}>
            <li>Einführung eines verbindlichen Human-Override-Prinzips</li>
            <li>Einrichtung eines unabhängigen Systemauditgremiums</li>
            <li>Gesetzliche Definition der HYDRA-Kompetenzgrenzen</li>
            <li>Regelmäßige Transparenzberichte</li>
          </ul>

        </div>

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
          <div>PES-Rechtsabteilung</div>
          <div>Gutachten 2026-HYD-01</div>
          <div>Seite 1 von 1</div>
        </div>
      </div>
    </div>
  );
}
