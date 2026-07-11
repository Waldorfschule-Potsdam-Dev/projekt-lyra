
export default function Notfallkontakte() {
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
        <div style={{ backgroundColor: '#cc0000', color: '#fff', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', borderRadius: '4px', marginBottom: '30px' }}>
          🚨 Familien-Notfallplan – Wichtige Kontakte
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #cc0000', paddingBottom: '4px', color: '#cc0000' }}>👨‍👩‍👧‍👦 Familie</h2>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              <strong>❤ Helena (Ehefrau)</strong><br/>
              📞 +49 30 8320-5547<br/>
              ✉️ a.seidt@cardea-partner.de<br/>
              <em style={{ color: '#cc0000' }}>Bei Notfällen immer zuerst informieren!</em>
              <br/><br/>
              <strong>👨 Vater (Holger)</strong><br/>
              📞 +49 6221 473-2918
              <br/><br/>
              <strong>👩 Mutti (Margit)</strong><br/>
              📞 +49 6221 9908-112
              <br/><br/>
              <strong>👩 Dr. S. (Leonie)</strong><br/>
              📞 +49 228 73-4895
            </div>
          </div>

          <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #0056b3', paddingBottom: '4px', color: '#0056b3' }}>🚔 Polizei & Behörden</h2>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              <strong>Polizeipräsident Volker Bachmair</strong><br/>
              📞 +49 30 4664-1010<br/><br/>
              <strong>Marco Lehnen (LKA)</strong><br/>
              📞 +49 30 4664-4110<br/><br/>
              <strong>Generalstaatsanwältin Dr. Silvia Wend</strong><br/>
              📞 +49 721 18-5810
            </div>
          </div>

          <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #28a745', paddingBottom: '4px', color: '#28a745' }}>🏥 Ärzte</h2>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              Hausarzt: Dr. Klaus Hellweg<br/>
              Kinderärztin: Dr. med. Kathrin Vogt<br/>
              Zahnärztin: Dr. Annika Hörnchen<br/>
              Tierarzt: Dr. Rolf Frederking<br/>
              <em>(Alle im Telefon gespeichert)</em>
            </div>
          </div>

          <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #6c757d', paddingBottom: '4px', color: '#6c757d' }}>🏛️ Dienstlich & Sonstige</h2>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              Dr. Beatrice Foht: 📞 +49 30 18681-2200<br/>
              Lukas Stöver: 📞 +49 30 18681-4010<br/>
              CREDITUS (Dr. Hollwege): 📞 +49 69 7182-5001
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', borderBottom: '2px solid #cc0000', paddingBottom: '4px', marginTop: '20px', color: '#cc0000' }}>☎ Allgemeine Notrufnummern</h2>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', textAlign: 'center', marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', width: '50%' }}>Polizei</td>
              <td style={{ padding: '8px', border: '1px solid #ccc', color: '#cc0000', fontWeight: 'bold', fontSize: '18px' }}>110</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Feuerwehr / Rettungsdienst</td>
              <td style={{ padding: '8px', border: '1px solid #ccc', color: '#cc0000', fontWeight: 'bold', fontSize: '18px' }}>112</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Ärztlicher Bereitschaftsdienst</td>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>116117</td>
            </tr>
          </tbody>
        </table>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '4px', fontSize: '12px', border: '1px solid #e9ecef' }}>
          <strong>📋 Wichtige Reihenfolge im Notfall:</strong><br/>
          1. Helena verständigen | 2. Kinder in Sicherheit bringen | 3. Notruf 112/110 alarmieren | 4. Eltern informieren
        </div>
      </div>
    </div>
  );
}
