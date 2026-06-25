import { useState, useEffect } from 'react'
import WeddingInfo from './WeddingInfo'
import GuestSheet from './GuestSheet'
import { loadWeddingInfo, saveWeddingInfo, loadGuestSheet, saveGuestSheet } from './data'

const TABS = [
  { key: 'info', label: 'Wedding Details' },
  { key: 'guests', label: 'Guest List' },
]

export default function App() {
  const [tab, setTab] = useState('info')
  const [info, setInfo] = useState(loadWeddingInfo)
  const [sheet, setSheet] = useState(loadGuestSheet)

  useEffect(() => { saveWeddingInfo(info) }, [info])
  useEffect(() => { saveGuestSheet(sheet) }, [sheet])

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="serif" style={{ fontSize: 30, fontWeight: 400 }}>
          {info.coupleName || "Your Wedding"}
        </div>
        <div style={{ fontSize: 13, color: '#A89880', marginTop: 2 }}>
          {[info.weddingDate, info.venue].filter(Boolean).join(' · ') || 'Fill in your wedding details to get started'}
        </div>
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

      {tab === 'info' && <WeddingInfo info={info} setInfo={setInfo} />}
      {tab === 'guests' && <GuestSheet sheet={sheet} setSheet={setSheet} />}
    </div>
  )
}
