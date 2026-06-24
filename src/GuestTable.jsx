import { useState } from 'react'
import { GUEST_FIELDS, EMPTY_GUEST, RSVP_OPTIONS } from './data'

function Cell({ guest, field, onChange }) {
  const val = guest[field.key]

  if (field.type === 'bool') {
    return (
      <input type="checkbox" checked={!!val} onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: 'pointer' }} />
    )
  }

  if (field.type === 'select') {
    return (
      <select value={val} onChange={e => onChange(e.target.value)} style={selectStyle}>
        {field.options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    )
  }

  return (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder="—" style={inputStyle} />
  )
}

export default function GuestTable({ guests, setGuests }) {
  const [adding, setAdding] = useState(false)
  const [newGuest, setNewGuest] = useState(EMPTY_GUEST)
  const [filterRsvp, setFilterRsvp] = useState('All')
  const [search, setSearch] = useState('')

  const update = (i, key, val) => setGuests(gs => gs.map((g, idx) => idx === i ? { ...g, [key]: val } : g))
  const remove = (i) => setGuests(gs => gs.filter((_, idx) => idx !== i))
  const saveNew = () => {
    if (!newGuest.name.trim()) return
    setGuests(gs => [...gs, { ...newGuest }])
    setNewGuest(EMPTY_GUEST)
    setAdding(false)
  }

  const filtered = guests
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => filterRsvp === 'All' || g.rsvp === filterRsvp)
    .filter(({ g }) => !search.trim() || g.name.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    total: guests.length,
    yes: guests.filter(g => g.rsvp === 'Yes').length,
    no: guests.filter(g => g.rsvp === 'No').length,
    pending: guests.filter(g => g.rsvp === 'Pending').length,
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Guest List</div>
          <div style={{ fontSize: 12, color: '#A89880', marginTop: 2 }}>
            {counts.total} guests · {counts.yes} attending · {counts.pending} pending · {counts.no} declined
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 160 }} />
          <select value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)} style={selectStyle}>
            <option>All</option>
            {RSVP_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <button onClick={() => { setAdding(true); setNewGuest(EMPTY_GUEST) }} style={addBtn}>+ Add Guest</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {GUEST_FIELDS.map(f => (
                <th key={f.key} style={thStyle}>{f.label.toUpperCase()}</th>
              ))}
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ g, i }) => (
              <tr key={i} style={{ borderBottom: '1px solid #F9F6F0' }}
                onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                {GUEST_FIELDS.map(f => (
                  <td key={f.key} style={cellStyle}>
                    <Cell guest={g} field={f} onChange={val => update(i, f.key, val)} />
                  </td>
                ))}
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <button onClick={() => remove(i)} title="Delete" style={deleteBtn}>✕</button>
                </td>
              </tr>
            ))}

            {adding && (
              <tr style={{ background: '#FDFCF9' }}>
                {GUEST_FIELDS.map(f => (
                  <td key={f.key} style={cellStyle}>
                    <Cell guest={newGuest} field={f} onChange={val => setNewGuest(g => ({ ...g, [f.key]: val }))} />
                  </td>
                ))}
                <td style={{ ...cellStyle, display: 'flex', gap: 6 }}>
                  <button onClick={saveNew} style={saveBtn}>Save</button>
                  <button onClick={() => setAdding(false)} style={cancelBtn}>✕</button>
                </td>
              </tr>
            )}

            {filtered.length === 0 && !adding && (
              <tr><td colSpan={GUEST_FIELDS.length + 1} style={{ padding: 40, textAlign: 'center', color: '#A89880', fontSize: 13 }}>
                No guests match this view.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const cellStyle = { padding: '8px 12px', fontSize: 13, whiteSpace: 'nowrap' }
const thStyle = { padding: '11px 12px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.08em', borderBottom: '1px solid #F0EDE8', background: '#FDFCF9', whiteSpace: 'nowrap' }
const inputStyle = { border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', width: 130, boxSizing: 'border-box', outline: 'none' }
const selectStyle = { ...inputStyle, width: 110, cursor: 'pointer' }
const addBtn = { background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const deleteBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }
const saveBtn = { background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const cancelBtn = { background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer' }
