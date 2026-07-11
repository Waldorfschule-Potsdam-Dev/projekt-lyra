
export default function FamilienNotfallplan() {
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
        padding: '40px 48px',
      }}>
        <h1 style={{ fontSize: '24px', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '24px', textAlign: 'center' }}>
          Familien-Notfallplan – Familie Seidt
        </h1>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>1. Allgemeine Übersicht</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
          Dieser Notfallplan gilt für die Familie Seidt:<br />
          - <strong>Daniel Seidt</strong> (Haushaltsvorstand)<br />
          - <strong>Helena Seidt, geb. Brauer</strong> (Richterin am Familiengericht Berlin-Schöneberg)<br />
          - <strong>Nick Seidt</strong> (geb. 12.09.2016)<br />
          - <strong>Lotta Seidt</strong> (geb. 03.05.2019)<br /><br />
          Ziel: Sicherstellung von Betreuung, medizinischer Versorgung, Kommunikation und Wohnsituation im Notfall.
        </p>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>2. Wichtige Wohnsitze</h2>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Hauptwohnung (Berlin-Pankow)</h3>
        <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '16px', paddingLeft: '20px' }}>
          <li>Adresse: Schönhauser Allee 84, 172 m²</li>
          <li>Nutzung: Familienalltag, Schul- und Arbeitsorganisation</li>
          <li>Besonderheiten: Katzenzimmer, Innenhofbalkon</li>
          <li>Eigentümer: Liegenschaftsverwaltung der PES</li>
        </ul>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Rückzugswohnung (Potsdam-Babelsberg)</h3>
        <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Adresse: Karl-Marx-Straße 12a, 96 m²</li>
          <li>Nutzung: Ruhe- und Ausweichstandort bei Krisen / Arbeitsbelastung</li>
        </ul>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>3. Notfallkontakte (Primär)</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '48%' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Familie</h3>
            <ul style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li>Helena Seidt (Ehefrau, Richterin)</li>
              <li>Nick Seidt (Sohn, Schule)</li>
              <li>Lotta Seidt (Tochter, Schule/Kita-Nähe)</li>
            </ul>
          </div>
          <div style={{ width: '48%' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Medizinische Betreuung</h3>
            <ul style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li>Dr. Friedrich Born – Hausarzt</li>
              <li>Dr. Heinrich von Lücke – NVS-Poliklinik</li>
              <li>Dr. Ulrich Falkenhagen – Kardiologie</li>
              <li>Dr. Bettina Schreiber – Augenheilkunde</li>
              <li>Dr. Stefan Liebig – HNO (Kinder)</li>
              <li>Dr. Cordula Henkel – Tiermedizin</li>
            </ul>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>4. Medizinische Besonderheiten</h2>
        <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', paddingLeft: '20px' }}>
          <li><strong>Daniel Seidt:</strong> Spannungskopfschmerzen bei Überlastung, Schlafdefizit (Ø 5,2 h), Pollenallergie, leicht erhöhte Cholesterinwerte, Vitamin-D-Mangel</li>
          <li><strong>Nick Seidt:</strong> Hausstauballergie (seit 2019)</li>
          <li><strong>Lotta Seidt:</strong> rezidivierende Mittelohrentzündung, Paukendrainage (2024)</li>
        </ul>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>5. Sofortmaßnahmen im Notfall</h2>
        <div style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>
          <strong>A) Medizinischer Notfall</strong><br/>
          1. Sofort Rettungsdienst kontaktieren (112)<br/>
          2. NVS-Poliklinik informieren (falls sicherheitsrelevant)<br/>
          3. Dr. Friedrich Born oder Dr. von Lücke benachrichtigen<br/>
          4. Helena Seidt informieren (Priorität 1)
        </div>
        <div style={{ fontSize: '13px', marginBottom: '20px' }}>
          <strong>B) Betreuung der Kinder</strong><br/>
          Primär: Helena Seidt. Alternativ: Sarah, Laura, Markus Seidt. Schulische Abholung: Konrad-Adenauer-Schule.<br/><br/>
          <strong>C) Wohnungs-/Logistikfall</strong><br/>
          1. Berlin-Pankow als Standard sichern<br/>
          2. Ausweichwohnung Potsdam-Babelsberg aktivieren<br/>
          3. Wichtige Dokumente: Personalausweise, Krankenversicherung, Schulunterlagen, Impfhefte.
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>6. Kommunikationsplan</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
          <strong>Prioritätsreihenfolge:</strong> 1. Helena Seidt, 2. Kinder, 3. Eltern / Geschwister, 4. Dienstliche Kontakte.<br/>
          <strong>Wichtige Regel:</strong> Keine Eskalation ohne Rücksprache mit Helena oder direktem medizinischen Notfall.
        </p>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>7. Schule & Betreuung</h2>
        <ul style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', paddingLeft: '20px' }}>
          <li><strong>Nick:</strong> Konrad-Adenauer-Schule (Leitung: Dr. Helmut Fahrer), strukturierter Tagesablauf notwendig.</li>
          <li><strong>Lotta:</strong> gleiche Schule (1. Klasse), empfindlich bei Infekten → schnelle Reaktion erforderlich.</li>
        </ul>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#0056b3' }}>8. Fahrzeuge & Finanzen im Notfall</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
          <strong>Fahrzeuge:</strong> Audi A6 (Dienstfahrzeug, kurzfristige Mobilität), Lamborghini Urus S (Privat, Langstrecke / Familie). Empfehlung: Audi A6 für schnelle Verfügbarkeit im Stadtgebiet.<br/><br/>
          <strong>Finanzen:</strong> Hauptkonto: SDO. Liquidität: ausreichend für 6–12 Monate Grundversorgung. Wichtige Dokumente griffbereit.
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ccc', fontSize: '10px', color: '#888', textAlign: 'center' }}>
          DOKUMENT: FAMILIEN-NOTFALLPLAN SEIDT | STAND: 10.02.2026 | SEITE 1 VON 1
        </div>
      </div>
    </div>
  );
}
