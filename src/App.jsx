import { useState, useEffect, useRef } from 'react'
import WeddingInfo from './WeddingInfo'
import GuestSheet from './GuestSheet'
import Messages from './Messages'
import { loadWeddingInfo, saveWeddingInfo, loadGuestSheet, saveGuestSheet, loadMessages, saveMessages } from './data'

const TABS = [
  { key: 'guests', label: 'Guest List' },
  { key: 'messages', label: 'Messages' },
  { key: 'info', label: 'Wedding Details' },
]

const pencilBtn = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
  color: '#B89A6A', padding: '2px 4px', lineHeight: 1, display: 'inline-flex', alignItems: 'center',
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M3 20l1.05-3.78a2 2 0 0 1 .53-.92L16.5 3.37a1.5 1.5 0 0 1 2.12 0l1.01 1.01a1.5 1.5 0 0 1 0 2.12L7.7 18.42a2 2 0 0 1-.92.53L3 20z" />
    </svg>
  )
}

function TitleLine({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => { onSave(draft.trim()); setEditing(false) }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        className="serif"
        style={{
          fontSize: 30, fontWeight: 400, border: 'none', borderBottom: '1px solid #B89A6A',
          background: 'transparent', outline: 'none', padding: 0, color: '#2C2416', width: '100%',
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="serif" style={{ fontSize: 30, fontWeight: 400 }}>{value || 'Your Wedding'}</div>
      <button title="Edit" style={pencilBtn} onClick={() => { setDraft(value); setEditing(true) }}><PencilIcon /></button>
    </div>
  )
}

function DetailsLine({ weddingDate, venue, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draftDate, setDraftDate] = useState(weddingDate)
  const [draftVenue, setDraftVenue] = useState(venue)

  const commit = () => { onSave({ weddingDate: draftDate, venue: draftVenue.trim() }); setEditing(false) }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <input
          type="date"
          value={draftDate}
          onChange={e => setDraftDate(e.target.value)}
          style={{ border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', outline: 'none' }}
        />
        <input
          value={draftVenue}
          onChange={e => setDraftVenue(e.target.value)}
          placeholder="Venue"
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          style={{ border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', outline: 'none' }}
        />
        <button onClick={commit} style={{ ...pencilBtn, color: '#7A8C6E' }} title="Save">✓</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
      <div style={{ fontSize: 13, color: '#A89880' }}>
        {[weddingDate, venue].filter(Boolean).join(' · ') || 'Fill in your wedding details to get started'}
      </div>
      <button
        title="Edit"
        style={pencilBtn}
        onClick={() => { setDraftDate(weddingDate); setDraftVenue(venue); setEditing(true) }}
      ><PencilIcon /></button>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('guests')
  const [info, setInfo] = useState(loadWeddingInfo)
  const [sheet, setSheet] = useState(loadGuestSheet)
  const [messages, setMessages] = useState(loadMessages)

  useEffect(() => { saveWeddingInfo(info) }, [info])
  useEffect(() => { saveGuestSheet(sheet) }, [sheet])
  useEffect(() => { saveMessages(messages) }, [messages])

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <TitleLine value={info.coupleName} onSave={coupleName => setInfo(prev => ({ ...prev, coupleName }))} />
        <DetailsLine
          weddingDate={info.weddingDate}
          venue={info.venue}
          onSave={({ weddingDate, venue }) => setInfo(prev => ({ ...prev, weddingDate, venue }))}
        />
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
      {tab === 'guests' && <GuestSheet sheet={sheet} setSheet={setSheet} sentMessages={messages.sent} />}
      {tab === 'messages' && <Messages info={info} sheet={sheet} messages={messages} setMessages={setMessages} />}
    </div>
  )
}
