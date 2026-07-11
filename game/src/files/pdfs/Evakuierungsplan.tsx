
export default function Evakuierungsplan() {
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
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          <strong>Familie:</strong> Seidt<br/>
          <strong>Version:</strong> 1.0<br/>
          <strong>Zweck:</strong> Schnelles und sicheres Verlassen des Hauses im Notfall
        </div>

        <h1 style={{ fontSize: '24px', borderBottom: '2px solid #e67e22', paddingBottom: '12px', marginBottom: '24px', color: '#e67e22', textAlign: 'center' }}>
          🏠 Evakuierungsplan – Wohnhaus
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>📍 Sammelpunkt</h2>
            <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
              <strong>Primärer Sammelpunkt:</strong><br/>
              Gehweg auf der gegenüberliegenden Straßenseite. Min. 30 Meter Abstand.<br/><br/>
              <strong>Alternativer Sammelpunkt:</strong><br/>
              Nächster öffentlicher Parkplatz / Grünfläche.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🎒 Notfallrucksack</h2>
            <ul style={{ fontSize: '12px', lineHeight: 1.5, paddingLeft: '20px', margin: 0 }}>
              <li>Ausweiskopien, Krankenkarte</li>
              <li>Wasser, Snacks, Erste-Hilfe-Set</li>
              <li>Taschenlampe, Powerbank</li>
              <li>Wichtige Medikamente, Bargeld</li>
              <li>Ersatzschlüssel, Telefonliste</li>
            </ul>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #e67e22', paddingBottom: '4px', marginBottom: '12px', color: '#e67e22' }}>🚪 Fluchtwege Hauptwohnung</h2>
        <div style={{ backgroundColor: '#fdf3e7', padding: '12px', borderRadius: '4px', fontSize: '13px', marginBottom: '24px' }}>
          <strong>Hauptroute:</strong> 1. Schlafzimmer verlassen ➔ 2. Flur nutzen ➔ 3. Haustür öffnen ➔ 4. Gebäude über Haupteingang verlassen ➔ 5. Sammelpunkt<br/>
          <strong>Alternativ:</strong> 1. Nächstgelegener zweiter Ausgang ➔ 2. Niemals Aufzüge benutzen ➔ 3. Türen hinter sich schließen
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #e67e22', paddingBottom: '4px', marginBottom: '12px', color: '#e67e22' }}>👨‍👩‍👧 Aufgabenverteilung</h2>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', width: '30%', backgroundColor: '#f9f9f9' }}>Erwachsene</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Ruhe bewahren, Kinder zusammenführen, Notruf absetzen, Vollzähligkeit prüfen, Haustür schließen (nicht abschließen).</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>Kind 1</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Sofort zum Sammelpunkt gehen, nicht zurück ins Gebäude laufen.</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>Kind 2</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Bleibt immer bei einem Erwachsenen.</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>Haustiere</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>Nur mitnehmen, wenn ohne Zeitverlust möglich. Keine Rückkehr für Tiere.</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: '1 1 45%' }}>
            <h2 style={{ fontSize: '15px', color: '#c0392b', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🔥 Brand</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              Personen warnen, Türen schließen, sofort verlassen, keine Aufzüge. Rauch vermeiden (gebückt gehen).
            </p>
          </div>
          <div style={{ flex: '1 1 45%' }}>
            <h2 style={{ fontSize: '15px', color: '#2980b9', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>⚡ Stromausfall</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              Taschenlampen verwenden, Sicherungskasten nur kontrollieren wenn gefahrlos. Geräte aus.
            </p>
          </div>
          <div style={{ flex: '1 1 45%' }}>
            <h2 style={{ fontSize: '15px', color: '#8e44ad', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🌩 Unwetter</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              Fenster/Türen zu, Abstand zu Fenstern. Wetterwarnungen verfolgen, drinnen bleiben.
            </p>
          </div>
          <div style={{ flex: '1 1 45%' }}>
            <h2 style={{ fontSize: '15px', color: '#27ae60', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🩺 Med. Notfall</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              Erste Hilfe, Notruf 112. Rettung einweisen, Med-Infos bereithalten.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', fontSize: '12px', lineHeight: 1.5, textAlign: 'center', fontWeight: 'bold', border: '1px solid #ffeeba' }}>
          📞 Notruf: Feuerwehr/Rettung 112 | Polizei 110<br/>
          (Wer? Wo? Was? Warten auf Rückfragen!)
        </div>

      </div>
    </div>
  );
}
