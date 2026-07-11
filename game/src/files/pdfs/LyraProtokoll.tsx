export default function LyraProtokoll() {
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
          backgroundColor: '#8b0000',
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '11px',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          Klassifikation: STRENG GEHEIM (STUFE 10)
        </div>

        <div style={{ padding: '40px 48px', flex: 1, lineHeight: 1.6 }}>
          <h1 style={{ fontSize: '24px', borderBottom: '2px solid #8b0000', paddingBottom: '8px', color: '#8b0000' }}>LYRA-PROTOKOLL</h1>
          <h2 style={{ fontSize: '16px', color: '#555', marginTop: '12px' }}>Autor: Konsilium der PES</h2>
          <h2 style={{ fontSize: '16px', color: '#555', marginBottom: '32px' }}>Datum: 14. September 2025</h2>

          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Präambel</h3>
          <p>Dieses Dokument beschreibt die abschließende Phase der staatlichen Transformation (Projektname: LYRA). Die bisherigen Phasen der Stabilisierung und der bürokratischen Ausrichtung sind abgeschlossen. Die Bevölkerung hat sich an die lenkende Hand des Staates gewöhnt. Nun folgt der irreversible Schritt zur vollständigen Machtkonzentration.</p>

          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginTop: '24px' }}>Phase 1: Die Informationsmonopol-Sicherung</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Kontrolle der Infrastruktur:</strong> Vollständige Übernahme aller digitalen und physischen Kommunikationsnetzwerke durch das Zentralamt für Informationssicherheit (ZFI).</li>
            <li><strong>PROMETHEUS-Integration:</strong> Das PROMETHEUS-System wird aus dem Testbetrieb in die aktive, landesweite Überwachung überführt. Algorithmen werden so kalibriert, dass Abweichungen von der Parteilinie präventiv erkannt und neutralisiert werden.</li>
            <li><strong>Isolierung:</strong> Reduzierung und strenge Kontrolle aller Datenströme ins und aus dem Ausland.</li>
          </ul>

          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginTop: '24px' }}>Phase 2: Die institutionelle Gleichschaltung</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Auflösung parlamentarischer Reste:</strong> Das Parlament wird durch einen "Rat der Experten" ersetzt, dessen Mitglieder ausschließlich durch das Konsilium der PES ernannt werden.</li>
            <li><strong>Justizreform:</strong> Die Justiz wird nicht mehr dem Gesetz, sondern dem Willen der Partei unterstellt. Recht ist, was dem Staat nützt.</li>
            <li><strong>Wehrdirektorat-Unterordnung:</strong> Die Streitkräfte und Polizeibehörden werden restrukturiert und direkt dem Ersten Kanzler unterstellt.</li>
          </ul>

          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginTop: '24px' }}>Phase 3: Die gesellschaftliche Re-Organisation</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Das Punktesystem:</strong> Das bisher freiwillige soziale Belohnungssystem wird verbindlich. Zuteilung von Wohnraum, Rationen und medizinischer Versorgung (siehe Projekt HYDRA) hängt direkt vom Loyalitätsindex ab.</li>
            <li><strong>Eliminierung von Störfaktoren:</strong> Identifizierte kritische Elemente (Journalisten, Oppositionelle, unkooperative Beamte) werden systematisch isoliert, diskreditiert und entfernt. (Vergleiche Liste Z-01 bis Z-99).</li>
            <li><strong>Erziehung:</strong> Das Bildungssystem wird ausschließlich auf die Vermittlung der Parteidoktrin und die Ausbildung staatstreuer Funktionäre ausgerichtet.</li>
          </ul>

          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginTop: '24px' }}>Schlussbestimmung</h3>
          <p>Das LYRA-Protokoll ist das Fundament der neuen Epoche. Es gibt kein Zurück. Jeder Versuch, diese Maßnahmen zu verzögern oder zu sabotieren, wird als Hochverrat betrachtet. Die Allianz ist ewig.</p>
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
          <div>PES-Führungsebene</div>
          <div>LYRA-PROTOKOLL</div>
          <div>Seite 1 von 1</div>
        </div>
      </div>
    </div>
  );
}
