
export default function Versicherungsliste() {
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
          <strong>Status:</strong> Übersicht / Archiv
        </div>

        <h1 style={{ fontSize: '24px', borderBottom: '2px solid #1a5f7a', paddingBottom: '12px', marginBottom: '24px', color: '#1a5f7a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>📁</span> Versicherungsordner
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🛡️ 1. Haftpflichtversicherung</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Versicherer:</strong> ADV<br/>
              <strong>Police:</strong> ADV-HP-77492015-SEI<br/>
              <strong>Deckungssumme:</strong> 50 Mio. € pauschal<br/>
              <strong>Besonderheiten:</strong> Einschluss deliktunfähiger Kinder, Schlüsselverlust bis 50.000 €
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🏠 2. Hausratversicherung</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Versicherer:</strong> NordSicher AG<br/>
              <strong>Police:</strong> NS-HR-88312019-PB<br/>
              <strong>Versicherungssumme:</strong> 180.000 €<br/>
              <strong>Leistungen:</strong> Feuer, Wasser, Einbruch, Sturm, Elementarschäden
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🏢 3. Wohngebäude</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Objekt:</strong> Karl-Marx-Str 12a, Potsdam<br/>
              <strong>Versicherer:</strong> StadtSafe<br/>
              <strong>Wiederherstellungswert:</strong> 620.000 €
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🏥 4. Krankenversicherung</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Versicherer:</strong> MEDIplus Privat<br/>
              <strong>Tarif:</strong> KomfortPlus Familie<br/>
              <strong>Leistungen:</strong> Chefarzt, 2-Bett-Zimmer, Zahnzusatz 90%
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🧠 5. Unfallversicherung</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Versicherer:</strong> SAFE-Life<br/>
              <strong>Invaliditätssumme:</strong> 750.000 €<br/>
              <strong>Leistungen:</strong> Rente, Bergungskosten
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>🧾 6. Lebensversicherung</h2>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Versicherer:</strong> Continental Life<br/>
              <strong>Summe:</strong> 500.000 €<br/>
              <strong>Bezugsberechtigte:</strong> Helena Seidt, Kinder
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #1a5f7a', paddingBottom: '4px', marginBottom: '16px', color: '#1a5f7a' }}>🚗 7. Kfz-Versicherungen</h2>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
            <strong>Lamborghini Urus S (B-JF 314)</strong><br/>
            PremiumDrive AG | Vollkasko + GAP
          </div>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
            <strong>Audi A6 (B-MIK 7782)</strong><br/>
            Bundesdienst Kfz-Schutz | Vollkasko Dienststelle
          </div>
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '1px solid #1a5f7a', paddingBottom: '4px', marginBottom: '16px', color: '#1a5f7a' }}>📞 10. Versicherungs-Notfallkontakte</h2>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Bereich</th>
              <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Kontakt</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '8px', border: '1px solid #ccc' }}>Haftpflicht</td><td style={{ padding: '8px', border: '1px solid #ccc' }}>+49 40 8001-1100</td></tr>
            <tr><td style={{ padding: '8px', border: '1px solid #ccc' }}>Hausrat</td><td style={{ padding: '8px', border: '1px solid #ccc' }}>+49 40 8001-2200</td></tr>
            <tr><td style={{ padding: '8px', border: '1px solid #ccc' }}>Kfz</td><td style={{ padding: '8px', border: '1px solid #ccc' }}>+49 40 8001-3300</td></tr>
            <tr><td style={{ padding: '8px', border: '1px solid #ccc' }}>Kranken</td><td style={{ padding: '8px', border: '1px solid #ccc' }}>+49 40 8001-4400</td></tr>
            <tr><td style={{ padding: '8px', border: '1px solid #ccc' }}>Rechtsschutz</td><td style={{ padding: '8px', border: '1px solid #ccc' }}>+49 40 8001-5500</td></tr>
          </tbody>
        </table>

        <div style={{ backgroundColor: '#fff3cd', padding: '16px', borderRadius: '4px', fontSize: '12px', lineHeight: 1.5 }}>
          <strong>📌 Hinweise:</strong><br/>
          - Policen jährlich prüfen (Januar)<br/>
          - Schadenfälle sofort dokumentieren (Fotos + Uhrzeit)<br/>
          - Originaldokumente im Tresor in Berlin-Pankow<br/>
          - Notfallnummern im Handy gespeichert unter „Versicherung SOS“
        </div>

      </div>
    </div>
  );
}
