import { useState } from 'react'

export default function UploadScreen({ onGenerate }) {
  const [pastedNotes, setPastedNotes] = useState('')
  const [files, setFiles] = useState({})
  const [dragging, setDragging] = useState(null)

  const handleFile = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setFiles(f => ({ ...f, [key]: e.target.result }))
    reader.readAsText(file)
  }

  const DropZone = ({ label, fileKey, icon }) => (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(fileKey) }}
      onDragLeave={() => setDragging(null)}
      onDrop={e => { e.preventDefault(); setDragging(null); handleFile(fileKey, e.dataTransfer.files[0]) }}
      onClick={() => document.getElementById('file-' + fileKey).click()}
      style={{
        border: `1.5px dashed ${dragging === fileKey ? '#B89A6A' : files[fileKey] ? '#7A8C6E' : '#D4C8B4'}`,
        borderRadius: 10, padding: '18px 16px', textAlign: 'center', cursor: 'pointer',
        background: files[fileKey] ? '#F0F5EE' : dragging === fileKey ? '#FBF7F0' : 'white',
        transition: 'all 0.2s',
      }}
    >
      <input id={'file-' + fileKey} type="file" accept=".csv" style={{ display: 'none' }}
        onChange={e => handleFile(fileKey, e.target.files[0])} />
      <div style={{ fontSize: 22, marginBottom: 6 }}>{files[fileKey] ? '✓' : icon}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: files[fileKey] ? '#4A8C6E' : '#7A6E5C' }}>
        {files[fileKey] ? 'Uploaded' : label}
      </div>
      <div style={{ fontSize: 11, color: '#A89880', marginTop: 2 }}>.csv</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#B89A6A', marginBottom: 16, fontWeight: 400 }}>JUNE 20, 2026</div>
          <h1 className="serif upload-title" style={{ color: '#2C2416', marginBottom: 12 }}>
            Your AI Wedding<br /><em>Chief of Staff</em>
          </h1>
          <p style={{ fontSize: 15, color: '#7A6E5C', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            Upload your planning documents or paste notes below. Your Chief of Staff will organize everything, surface risks, and tell you exactly what to do next.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8DCC8', padding: '32px', marginBottom: 20, boxShadow: '0 2px 20px rgba(184,154,106,0.08)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>UPLOAD CSV FILES (OPTIONAL)</div>
          <div className="upload-grid">
            <DropZone label="vendors.csv" fileKey="vendors" icon="📋" />
            <DropZone label="budget.csv" fileKey="budget" icon="💰" />
            <DropZone label="timeline.csv" fileKey="timeline" icon="📅" />
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>OR PASTE PLANNING NOTES</div>
          <textarea
            value={pastedNotes}
            onChange={e => setPastedNotes(e.target.value)}
            placeholder="Paste anything — emails, notes, lists, vendor info..."
            style={{
              width: '100%', minHeight: 100, resize: 'vertical',
              border: '1px solid #E0D4C0', borderRadius: 8, padding: '12px 14px',
              fontSize: 13, color: '#2C2416', background: '#FDFCF9', outline: 'none',
              lineHeight: 1.6, fontFamily: 'Jost, sans-serif',
            }}
          />
        </div>

        <button
          onClick={() => onGenerate(files, pastedNotes)}
          style={{
            width: '100%', padding: '16px', background: '#2C2416', color: '#F9F6F0',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
            letterSpacing: '0.08em', cursor: 'pointer',
          }}
          onMouseOver={e => e.target.style.background = '#B89A6A'}
          onMouseOut={e => e.target.style.background = '#2C2416'}
        >
          Generate My Wedding Dashboard →
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#A89880', marginTop: 12 }}>
          No files? We'll use sample data so you can explore the full experience.
        </p>
      </div>
    </div>
  )
}
