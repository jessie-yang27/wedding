import { useState } from 'react'
import { parseCsv, rowsToGuests } from './data'

function sheetRowsToObjects(rows) {
  if (!rows?.length) return []
  const headers = rows[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.slice(1).filter(r => r.some(c => String(c || '').trim())).map(r => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = r[i] || '' })
    return obj
  })
}

export default function ImportGuests({ onImport, onClose }) {
  const [csvText, setCsvText] = useState('')
  const [error, setError] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [sheetsData, setSheetsData] = useState(null)

  const importFromCsvText = (text) => {
    try {
      const rows = parseCsv(text)
      const guests = rowsToGuests(rows)
      if (!guests.length) { setError('No guests found in that file — check the column headers.'); return }
      onImport(guests)
    } catch (e) {
      setError('Could not parse that file as CSV.')
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => importFromCsvText(String(reader.result))
    reader.readAsText(file)
  }

  const connectGoogle = async () => {
    setLoadingGoogle(true)
    setError('')
    try {
      const res = await fetch('/api/google-data')
      if (res.status === 401) {
        window.location.href = '/api/google-auth'
        return
      }
      if (!res.ok) { setError('Could not load Google Sheets.'); return }
      const data = await res.json()
      setSheetsData(data.sheets || [])
    } catch (e) {
      setError('Could not connect to Google.')
    } finally {
      setLoadingGoogle(false)
    }
  }

  const importFromSheetTab = (rows) => {
    const objs = sheetRowsToObjects(rows)
    const guests = rowsToGuests(objs)
    if (!guests.length) { setError('No guests found in that tab.'); return }
    onImport(guests)
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="serif" style={{ fontSize: 24, marginBottom: 6 }}>Import your guest list</div>
      <p style={{ fontSize: 13, color: '#A89880', marginBottom: 24 }}>
        Pull in guests from a CSV export (TheKnot, WeddingWire, Excel) or connect Google Sheets.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ border: '1px solid #E8DCC8', borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>UPLOAD CSV</div>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} style={{ fontSize: 13 }} />
        </div>

        <div style={{ border: '1px solid #E8DCC8', borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>OR PASTE CSV TEXT</div>
          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="name,email,phone,rsvp,..."
            style={{ width: '100%', minHeight: 100, border: '1px solid #E0D4C0', borderRadius: 8, padding: 10, fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
          <button
            onClick={() => importFromCsvText(csvText)}
            disabled={!csvText.trim()}
            style={{ marginTop: 10, background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: csvText.trim() ? 'pointer' : 'not-allowed', opacity: csvText.trim() ? 1 : 0.5 }}
          >
            Import pasted CSV
          </button>
        </div>

        <div style={{ border: '1px solid #E8DCC8', borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>GOOGLE SHEETS</div>
          {!sheetsData && (
            <button
              onClick={connectGoogle}
              disabled={loadingGoogle}
              style={{ background: 'white', border: '1px solid #E0D4C0', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
            >
              {loadingGoogle ? 'Connecting…' : 'Connect Google Sheets'}
            </button>
          )}
          {sheetsData && sheetsData.length === 0 && (
            <p style={{ fontSize: 13, color: '#A89880' }}>No spreadsheets found in your Google Drive.</p>
          )}
          {sheetsData && sheetsData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sheetsData.map(file => (
                <div key={file.id}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{file.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {file.tabs.map(t => (
                      <button key={t.tab} onClick={() => importFromSheetTab(t.rows)}
                        style={{ background: '#F9F6F0', border: '1px solid #E8DCC8', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                        {t.tab}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#C4614A', fontSize: 13 }}>{error}</div>}

        <button onClick={onClose} style={{ background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}>
          Skip — use sample data
        </button>
      </div>
    </div>
  )
}
