import { useState } from 'react'

export default function ImportScreen({ googleData, onImport, onSkip }) {
  const { gmail = [], sheets = [] } = googleData

  const [selectedThreads, setSelectedThreads] = useState(
    () => new Set(gmail.map(t => t.id))
  )
  const [selectedSheet, setSelectedSheet] = useState(sheets[0]?.id || null)
  const [selectedTab, setSelectedTab] = useState(sheets[0]?.tabs?.[0]?.tab || null)
  const [columnMap, setColumnMap] = useState({})
  const [step, setStep] = useState('review') // 'review' | 'map'

  const activeSheet = sheets.find(s => s.id === selectedSheet)
  const activeTab = activeSheet?.tabs?.find(t => t.tab === selectedTab)
  const headers = activeTab?.rows?.[0] || []
  const previewRows = activeTab?.rows?.slice(1, 4) || []

  const toggleThread = id => setSelectedThreads(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleSheetSelect = (sheetId) => {
    setSelectedSheet(sheetId)
    const sheet = sheets.find(s => s.id === sheetId)
    setSelectedTab(sheet?.tabs?.[0]?.tab || null)
    setColumnMap({})
  }

  const handleTabSelect = (tab) => {
    setSelectedTab(tab)
    setColumnMap({})
  }

  const handleImport = () => {
    const threads = gmail.filter(t => selectedThreads.has(t.id))
    const rows = activeTab?.rows || []
    onImport({ threads, rows, columnMap, sheetName: activeSheet?.name, tabName: selectedTab })
  }

  const FIELD_LABELS = {
    vendor: 'Vendor name',
    category: 'Category',
    status: 'Status',
    cost: 'Cost / Price',
    dueDate: 'Due date',
    budget: 'Budget amount',
    spent: 'Amount spent',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#FDFCF9', display: 'flex',
      flexDirection: 'column', alignItems: 'center', padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 680, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>
            JESSIE'S WEDDING PLANNING
          </div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 300, color: '#2C2416', margin: '0 0 10px' }}>
            ✓ Google connected!
          </h1>
          <p style={{ fontSize: 14, color: '#7A6E5C', lineHeight: 1.6 }}>
            Here's what we found. Select what you'd like to import into your dashboard.
          </p>
        </div>

        {/* SHEETS SECTION */}
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <span>📊 Google Sheets</span>
            <span style={{ fontSize: 12, color: '#A89880', fontWeight: 400 }}>{sheets.length} spreadsheet{sheets.length !== 1 ? 's' : ''} found</span>
          </div>

          {sheets.length === 0 && (
            <div style={{ fontSize: 13, color: '#A89880', padding: '8px 0' }}>No spreadsheets found in this account.</div>
          )}

          {sheets.length > 0 && (
            <>
              {/* Sheet picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {sheets.map(s => (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    border: `1.5px solid ${selectedSheet === s.id ? '#2C2416' : '#E8DCC8'}`,
                    borderRadius: 10, cursor: 'pointer',
                    background: selectedSheet === s.id ? '#FAF7F2' : 'white',
                  }}>
                    <input type="radio" name="sheet" checked={selectedSheet === s.id}
                      onChange={() => handleSheetSelect(s.id)} style={{ accentColor: '#2C2416' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2416' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#A89880' }}>
                        {s.tabs?.length} tab{s.tabs?.length !== 1 ? 's' : ''} · Last edited {new Date(s.modified).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Tab picker */}
              {activeSheet?.tabs?.length > 1 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#B89A6A', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 8 }}>WHICH TAB?</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activeSheet.tabs.map(t => (
                      <button key={t.tab} onClick={() => handleTabSelect(t.tab)} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        border: `1px solid ${selectedTab === t.tab ? '#2C2416' : '#E8DCC8'}`,
                        background: selectedTab === t.tab ? '#2C2416' : 'white',
                        color: selectedTab === t.tab ? 'white' : '#7A6E5C',
                      }}>{t.tab}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Column mapping */}
              {headers.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#B89A6A', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 10 }}>
                    MAP YOUR COLUMNS <span style={{ color: '#A89880', fontWeight: 400, letterSpacing: 0 }}>— tell us what each column means</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {headers.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#2C2416', fontWeight: 500, minWidth: 100, background: '#F5F0E8', borderRadius: 6, padding: '4px 8px' }}>{h}</span>
                        <span style={{ color: '#C0B4A0', fontSize: 12 }}>→</span>
                        <select
                          value={columnMap[h] || ''}
                          onChange={e => setColumnMap(m => ({ ...m, [h]: e.target.value }))}
                          style={{ flex: 1, fontSize: 12, border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontFamily: 'Jost, sans-serif', background: 'white' }}
                        >
                          <option value="">Ignore</option>
                          {Object.entries(FIELD_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Data preview */}
                  {previewRows.length > 0 && (
                    <div style={{ background: '#F9F6F0', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#7A6E5C' }}>
                      <div style={{ fontWeight: 500, marginBottom: 6, color: '#A89880' }}>PREVIEW (first 3 rows)</div>
                      {previewRows.map((row, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 3, flexWrap: 'wrap' }}>
                          {row.map((cell, j) => (
                            <span key={j} style={{ background: 'white', borderRadius: 4, padding: '2px 6px', border: '1px solid #E8DCC8' }}>{cell}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* GMAIL SECTION */}
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <span>📧 Gmail threads</span>
            <span style={{ fontSize: 12, color: '#A89880', fontWeight: 400 }}>{gmail.length} vendor-related threads found</span>
          </div>

          {gmail.length === 0 && (
            <div style={{ fontSize: 13, color: '#A89880' }}>No vendor emails found.</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {gmail.map(t => (
              <label key={t.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                borderRadius: 8, cursor: 'pointer',
                background: selectedThreads.has(t.id) ? '#FAF7F2' : 'white',
                border: `1px solid ${selectedThreads.has(t.id) ? '#E0D4C0' : '#F0EDE8'}`,
              }}>
                <input type="checkbox" checked={selectedThreads.has(t.id)}
                  onChange={() => toggleThread(t.id)}
                  style={{ marginTop: 2, accentColor: '#2C2416', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2416', marginBottom: 2 }}>{t.subject}</div>
                  <div style={{ fontSize: 11, color: '#A89880' }}>
                    {t.senderName || t.from} · {t.messageCount} message{t.messageCount !== 1 ? 's' : ''}
                  </div>
                  {t.snippet && (
                    <div style={{ fontSize: 11, color: '#B89A6A', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.snippet}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {gmail.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button onClick={() => setSelectedThreads(new Set(gmail.map(t => t.id)))}
                style={linkBtn}>Select all</button>
              <button onClick={() => setSelectedThreads(new Set())}
                style={linkBtn}>Deselect all</button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleImport} style={{ ...primaryBtn, flex: 1 }}>
            Import to dashboard →
          </button>
          <button onClick={onSkip} style={ghostBtn}>
            Skip, use sample data
          </button>
        </div>

      </div>
    </div>
  )
}

const cardStyle = {
  background: 'white', borderRadius: 14, border: '1px solid #E8DCC8',
  padding: '24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(184,154,106,0.06)',
}
const sectionHeader = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontSize: 14, fontWeight: 600, color: '#2C2416', marginBottom: 16,
}
const primaryBtn = {
  padding: '14px 24px', background: '#2C2416', color: '#F9F6F0',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
  letterSpacing: '0.06em', cursor: 'pointer',
}
const ghostBtn = {
  padding: '14px 20px', background: 'transparent', color: '#A89880',
  border: '1px solid #E8DCC8', borderRadius: 10, fontSize: 13, cursor: 'pointer',
}
const linkBtn = {
  background: 'none', border: 'none', color: '#B89A6A', fontSize: 12,
  cursor: 'pointer', textDecoration: 'underline', padding: 0,
}
