import { useState } from 'react'
import GuestTable from './GuestTable'
import Messaging from './Messaging'
import AIAssistant from './AIAssistant'
import ImportGuests from './ImportGuests'
import { SAMPLE_GUESTS, daysUntil, WEDDING_DATE } from './data'

const TABS = [
  { key: 'guests', label: 'Guest List' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'ai', label: 'AI Assistant' },
]

export default function App() {
  const [guests, setGuests] = useState(SAMPLE_GUESTS)
  const [tab, setTab] = useState('guests')
  const [showImport, setShowImport] = useState(false)

  const handleImport = (importedGuests) => {
    setGuests(importedGuests)
    setShowImport(false)
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="serif" style={{ fontSize: 30, fontWeight: 400 }}>Jessie &amp; Patrick's Wedding</div>
          <div style={{ fontSize: 13, color: '#A89880', marginTop: 2 }}>
            {daysUntil(WEDDING_DATE)} days to go · {WEDDING_DATE.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button
          onClick={() => setShowImport(true)}
          style={{ background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em' }}
        >
          Import Guest List
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E8DCC8' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', borderBottom: `2px solid ${tab === t.key ? '#B89A6A' : 'transparent'}`,
              background: 'none', color: tab === t.key ? '#2C2416' : '#A89880',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'guests' && <GuestTable guests={guests} setGuests={setGuests} />}
      {tab === 'messaging' && <Messaging guests={guests} />}
      {tab === 'ai' && <AIAssistant guests={guests} />}

      {showImport && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowImport(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(44, 36, 22, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, zIndex: 1000, overflowY: 'auto',
          }}
        >
          <div style={{ position: 'relative', maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#FDFCF9', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <button
              onClick={() => setShowImport(false)}
              title="Close"
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 1,
                background: 'white', border: '1px solid #E8DCC8', borderRadius: '50%',
                width: 32, height: 32, fontSize: 14, color: '#7A6E5C', cursor: 'pointer',
              }}
            >✕</button>
            <ImportGuests onImport={handleImport} onClose={() => setShowImport(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
