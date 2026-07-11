
export default function KontoCreditus() {
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
          backgroundColor: '#34495e',
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '11px',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          Klassifikation: P-4 / Sensibel
        </div>

        <div style={{ padding: '40px 48px', flex: 1 }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '20px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              KONTO_CREDITUS – MÄRZ 2026
            </h1>
            <h2 style={{ fontSize: '14px', fontWeight: 'normal', color: '#555', margin: '0 0 16px 0' }}>
              Dokument: Finanz- und Bewegungsübersicht
            </h2>
            <div style={{ fontSize: '12px' }}>
              <strong>Bezugssystem:</strong> PES – Finanz- und Verwaltungsarchitektur
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', fontSize: '13px', marginBottom: '32px' }}>
            <div style={{ fontWeight: 'bold' }}>Kontobezeichnung:</div><div>Creditus</div>
            <div style={{ fontWeight: 'bold' }}>Referenzzeitraum:</div><div>März 2026</div>
            <div style={{ fontWeight: 'bold' }}>Kontotyp:</div><div>Zentraler Abrechnungs- und Projektmittelpool</div>
            <div style={{ fontWeight: 'bold' }}>Zuständige Instanz:</div><div>PES – Finanzen / Organisation</div>
            <div style={{ fontWeight: 'bold' }}>Status:</div><div>Abgeschlossen – Monatsauswertung</div>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            1. ZWECK DES KONTOS
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            Das Konto <strong>Creditus</strong> dient innerhalb der PES-Struktur als zentraler Sammel- und Verteilungspool für Projektmittel, Abwicklungsstelle für interne Transfers, Zwischenspeicher für Förder- und Programmbudgets sowie Kontrollpunkt für liquiditätsbasierte Steuerungsprozesse.
          </p>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            2. FINANZSTRUKTUR MÄRZ 2026
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>Im Berichtszeitraum März 2026 wurden folgende strukturelle Bewegungsmuster festgestellt:</p>
          <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px', paddingLeft: '20px' }}>
            <li>erhöhte Transaktionsdichte im Bereich Förderprogramme</li>
            <li>stabile Mittelzuflüsse aus zentralen Verwaltungsbudgets</li>
            <li>verstärkte Umlagerung zwischen Projektkonten</li>
            <li>temporäre Liquiditätsspitzen in der Monatsmitte</li>
          </ul>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            3. SYSTEMISCHE FUNKTION VON CREDITUS
          </h3>
          <div style={{ backgroundColor: '#f4f6f6', borderLeft: '4px solid #34495e', padding: '12px 16px', fontSize: '13px', fontStyle: 'italic', marginBottom: '24px' }}>
            Das Konto fungiert nicht als klassisches Bankkonto, sondern als interne Liquiditäts- und Steuerungsinstanz innerhalb der PES-Projektarchitektur. Es verbindet Budgetfreigaben, Projektfinanzierung, Rückflussmechanismen und Prioritätslogik (P-1 bis P-6).
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            4. TRANSAKTIONSLOGIK
          </h3>
          <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            <strong>Steuerungsprinzip:</strong> Finanzbewegungen erfolgen in einem Regelkreis: Bedarfsermittlung ➔ Prioritätszuweisung ➔ Budgetfreigabe ➔ Projektausführung ➔ Rückkopplung.<br/><br/>
            <strong>Charakter:</strong> Überwiegend interne Umbuchungen, projektgebundene Allokationen, systemische Verteilung.
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            5. RISIKO- UND STABILITÄTSANALYSE
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Risikokategorie</th>
                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Bewertung</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Liquiditätsschwankung</td><td style={{ padding: '8px', borderBottom: '1px solid #eee', color: 'green' }}>Niedrig</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Fehlzuweisung</td><td style={{ padding: '8px', borderBottom: '1px solid #eee', color: 'orange' }}>Mittel</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Intransparente Umlagerung</td><td style={{ padding: '8px', borderBottom: '1px solid #eee', color: 'orange' }}>Mittel</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Systemabhängigkeit</td><td style={{ padding: '8px', borderBottom: '1px solid #eee', color: 'red', fontWeight: 'bold' }}>Hoch</td></tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>
            6. MONATSBEWERTUNG
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '24px', fontWeight: 'bold' }}>
            Der Monat März 2026 wird als operativ stabil mit erhöhter Umlagerungsaktivität bewertet. Keine strukturellen Abweichungen festgestellt.
          </p>

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
          <div>PES-Finanzdokument</div>
          <div>Stand 31.03.2026</div>
          <div>Seite 1 von 1</div>
        </div>
      </div>
    </div>
  );
}
