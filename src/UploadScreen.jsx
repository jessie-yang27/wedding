import { useState } from 'react'

export default function UploadScreen({ onGenerate, onConnectGoogle }) {
  const [pastedNotes, setPastedNotes] = useState('')
  const [files, setFiles] = useState({})
  const [dragging, setDragging] = useState(null)
  const [activeMethod, setActiveMethod] = useState(null) // 'files' | 'text' | 'google'

  const handleFile = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setFiles(f => ({ ...f, [key]: e.target.result }))
    reader.readAsText(file)
  }

  const handleConnectGoogle = () => {
    window.location.href = `/api/google-auth?return=${encodeURIComponent(window.location.origin + '?google=connected')}`
  }

  const canGenerate = activeMethod === 'google'
    || (activeMethod === 'files' && (files.vendors || files.budget || files.timeline))
    || (activeMethod === 'text' && pastedNotes.trim().length > 0)

  const DropZone = ({ label, fileKey, icon }) => (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(fileKey) }}
      onDragLeave={() => setDragging(null)}
      onDrop={e => { e.preventDefault(); setDragging(null); handleFile(fileKey, e.dataTransfer.files[0]) }}
      onClick={() => document.getElementById('file-' + fileKey).click()}
      style={{
        border: `1.5px dashed ${dragging === fileKey ? '#B89A6A' : files[fileKey] ? '#7A8C6E' : '#D4C8B4'}`,
        borderRadius: 10, padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
        background: files[fileKey] ? '#F0F5EE' : dragging === fileKey ? '#FBF7F0' : '#FDFCF9',
        transition: 'all 0.2s',
      }}
    >
      <input id={'file-' + fileKey} type="file" accept=".csv" style={{ display: 'none' }}
        onChange={e => handleFile(fileKey, e.target.files[0])} />
      <div style={{ fontSize: 20, marginBottom: 5 }}>{files[fileKey] ? '✓' : icon}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: files[fileKey] ? '#4A8C6E' : '#7A6E5C' }}>
        {files[fileKey] ? 'Uploaded' : label}
      </div>
      <div style={{ fontSize: 10, color: '#A89880', marginTop: 2 }}>.csv</div>
    </div>
  )

  const methodCard = (key, icon, title, desc) => {
    const active = activeMethod === key
    return (
      <button
        key={key}
        onClick={() => setActiveMethod(active ? null : key)}
        style={{
          flex: 1, padding: '20px 16px', background: active ? '#2C2416' : 'white',
          border: `1.5px solid ${active ? '#2C2416' : '#E8DCC8'}`,
          borderRadius: 12, cursor: 'pointer', textAlign: 'center',
          transition: 'all 0.18s', color: active ? '#F9F6F0' : '#2C2416',
        }}
      >
        <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>{desc}</div>
      </button>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      background: '#FDFCF9',
    }}>
      <div style={{ maxWidth: 580, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>
            JESSIE'S WEDDING PLANNING
          </div>
          <h1 className="serif" style={{ fontSize: 48, fontWeight: 300, lineHeight: 1.1, color: '#2C2416', marginBottom: 14 }}>
            Your AI Wedding<br /><em>Chief of Staff</em>
          </h1>
          <p style={{ fontSize: 15, color: '#7A6E5C', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
            Get your wedding organized in minutes. Connect your accounts or drop in your planning docs — your Chief of Staff handles the rest.
          </p>
        </div>

        {/* Method picker */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {methodCard('google', '🔗', 'Connect accounts', 'Gmail & Google Sheets')}
          {methodCard('files', '📂', 'Upload files', 'Vendor, budget & timeline CSVs')}
          {methodCard('text', '✏️', 'Paste notes', 'Emails, lists, free text')}
        </div>

        {/* Expanded panels */}
        {activeMethod === 'google' && (
          <div style={panelStyle}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              {[
                ['📧', 'Gmail', 'Vendor quotes, confirmations & follow-ups'],
                ['📊', 'Google Sheets', 'Your vendor list, budget & timeline'],
              ].map(([icon, name, desc]) => (
                <div key={name} style={{
                  flex: 1, background: '#F9F6F0', borderRadius: 10,
                  padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2C2416' }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#A89880', lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#A89880', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
              🔒 Read-only access — we never send emails or edit your files.
            </div>
            <button onClick={handleConnectGoogle} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}>
              <GoogleIcon /> Connect Google account
            </button>
          </div>
        )}

        {activeMethod === 'files' && (
          <div style={panelStyle}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>
              DROP YOUR CSV FILES BELOW
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <DropZone label="vendors.csv" fileKey="vendors" icon="📋" />
              <DropZone label="budget.csv" fileKey="budget" icon="💰" />
              <DropZone label="timeline.csv" fileKey="timeline" icon="📅" />
            </div>
            <div style={{ fontSize: 11, color: '#A89880', marginTop: 12 }}>
              Don't have CSVs? Export from The Knot, Zola, or any spreadsheet app.
            </div>
          </div>
        )}

        {activeMethod === 'text' && (
          <div style={panelStyle}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>
              PASTE ANYTHING
            </div>
            <textarea
              value={pastedNotes}
              onChange={e => setPastedNotes(e.target.value)}
              placeholder="Paste emails, notes, vendor lists, budget numbers — anything you have. Your Chief of Staff will figure it out."
              style={{
                width: '100%', minHeight: 140, resize: 'vertical',
                border: '1px solid #E0D4C0', borderRadius: 8, padding: '12px 14px',
                fontSize: 13, color: '#2C2416', background: '#FDFCF9', outline: 'none',
                lineHeight: 1.6, fontFamily: 'Jost, sans-serif', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* CTA */}
        {activeMethod && activeMethod !== 'google' && (
          <button
            onClick={() => onGenerate(files, pastedNotes)}
            disabled={!canGenerate}
            style={{ ...primaryBtn, marginTop: 4, opacity: canGenerate ? 1 : 0.45 }}
          >
            Build my dashboard →
          </button>
        )}

        {/* No selection yet — show subtle skip */}
        {!activeMethod && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={() => onGenerate({}, '')} style={{
              background: 'none', border: 'none', color: '#B89A6A', fontSize: 13,
              cursor: 'pointer', textDecoration: 'underline', padding: 0,
            }}>
              Just show me a demo →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

const panelStyle = {
  background: 'white', borderRadius: 12, border: '1px solid #E8DCC8',
  padding: '24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(184,154,106,0.06)',
}

const primaryBtn = {
  width: '100%', padding: '15px', background: '#2C2416', color: '#F9F6F0',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
  letterSpacing: '0.08em', cursor: 'pointer', display: 'block',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
