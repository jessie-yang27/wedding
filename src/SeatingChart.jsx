import { useState } from 'react'
import { MEAL_OPTIONS, RSVP_STATUSES } from './data'
import { InlineEdit } from './components'

const EMPTY_GUEST = { name: '', table: '', meal: 'Chicken', rsvp: 'Pending' }

function TableVisual({ tableNumber, guestsAtTable, capacity }) {
  const size = 200
  const center = size / 2
  const radius = 74
  const seatW = 64
  const seatH = 30

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: center - 42, left: center - 42, width: 84, height: 84,
        borderRadius: '50%', background: '#FDFCF9', border: '2px solid #B89A6A',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <div className="serif" style={{ fontSize: 18, color: '#2C2416' }}>Table {tableNumber}</div>
        <div style={{ fontSize: 11, color: '#A89880' }}>{guestsAtTable.length}/{capacity}</div>
      </div>

      {Array.from({ length: capacity }).map((_, i) => {
        const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2
        const x = center + radius * Math.cos(angle) - seatW / 2
        const y = center + radius * Math.sin(angle) - seatH / 2
        const guest = guestsAtTable[i]
        return (
          <div
            key={i}
            title={guest ? `${guest.name} · ${guest.meal}` : `Seat ${i + 1} (open)`}
            style={{
              position: 'absolute', left: x, top: y, width: seatW, height: seatH,
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, padding: '0 6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              background: guest ? '#EAF4EE' : '#F5F0E8',
              border: guest ? '1px solid #9CC2AA' : '1px dashed #E0D4C0',
              color: guest ? '#2E6E4A' : '#C0B4A0',
            }}
          >
            {guest ? guest.name : 'Open'}
          </div>
        )
      })}
    </div>
  )
}

export default function SeatingChart({ guests, setGuests }) {
  const [view, setView] = useState('chart')
  const [capacity, setCapacity] = useState(8)
  const [tableCount, setTableCount] = useState(() => Math.max(3, ...guests.map(g => parseInt(g.table) || 0)))
  const [addingGuest, setAddingGuest] = useState(false)
  const [newGuest, setNewGuest] = useState(EMPTY_GUEST)

  const updateGuest = (i, field, val) => setGuests(gs => gs.map((g, idx) => idx === i ? { ...g, [field]: val } : g))
  const deleteGuest = (i) => setGuests(gs => gs.filter((_, idx) => idx !== i))
  const saveNewGuest = () => {
    if (!newGuest.name.trim()) return
    setGuests(gs => [...gs, { ...newGuest }])
    setNewGuest(EMPTY_GUEST)
    setAddingGuest(false)
  }

  const confirmed = guests.filter(g => g.rsvp === 'Confirmed').length
  const unassigned = guests.filter(g => !g.table)

  const cellStyle = { padding: '12px 16px', fontSize: 13 }
  const thStyle = { padding: '11px 16px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.1em', borderBottom: '1px solid #F0EDE8', background: '#FDFCF9' }
  const addRowInputStyle = { border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }
  const stepBtn = { width: 26, height: 26, borderRadius: 6, border: '1px solid #E0D4C0', background: 'white', color: '#7A6E5C', cursor: 'pointer', fontSize: 14, lineHeight: 1 }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>TOTAL GUESTS</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{guests.length}</div>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>CONFIRMED</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{confirmed}</div>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: unassigned.length ? '#C4614A' : '#B89A6A', marginBottom: 10, fontWeight: 500 }}>UNASSIGNED</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{unassigned.length}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Seating Chart</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {view === 'chart' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#7A6E5C' }}>Tables</span>
                  <button style={stepBtn} onClick={() => setTableCount(n => Math.max(1, n - 1))}>−</button>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{tableCount}</span>
                  <button style={stepBtn} onClick={() => setTableCount(n => n + 1)}>+</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#7A6E5C' }}>Seats/table</span>
                  <button style={stepBtn} onClick={() => setCapacity(n => Math.max(2, n - 1))}>−</button>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{capacity}</span>
                  <button style={stepBtn} onClick={() => setCapacity(n => n + 1)}>+</button>
                </div>
              </>
            )}
            <div style={{ display: 'flex', border: '1px solid #E0D4C0', borderRadius: 8, overflow: 'hidden' }}>
              {['chart', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: view === v ? '#2C2416' : 'white', color: view === v ? '#F9F6F0' : '#7A6E5C',
                }}>
                  {v === 'chart' ? 'Chart' : 'List'}
                </button>
              ))}
            </div>
            {view === 'list' && (
              <button onClick={() => { setAddingGuest(true); setNewGuest(EMPTY_GUEST) }} style={{
                background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em',
              }}>
                + Add Guest
              </button>
            )}
          </div>
        </div>

        {view === 'chart' && (
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: unassigned.length ? 24 : 0 }}>
              {Array.from({ length: tableCount }, (_, i) => i + 1).map(t => (
                <TableVisual
                  key={t}
                  tableNumber={t}
                  capacity={capacity}
                  guestsAtTable={guests.filter(g => parseInt(g.table) === t)}
                />
              ))}
            </div>

            {unassigned.length > 0 && (
              <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#C4614A', marginBottom: 12, fontWeight: 500 }}>UNASSIGNED GUESTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {unassigned.map((g) => {
                    const gi = guests.indexOf(g)
                    return (
                      <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FDFCF9', border: '1px solid #F0EDE8', borderRadius: 20, padding: '6px 8px 6px 14px' }}>
                        <span style={{ fontSize: 13, color: '#2C2416' }}>{g.name}</span>
                        <select
                          value={g.table}
                          onChange={e => updateGuest(gi, 'table', e.target.value)}
                          style={{ fontSize: 11, border: '1px solid #E0D4C0', borderRadius: 12, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', background: 'white' }}
                        >
                          <option value="">Seat…</option>
                          {Array.from({ length: tableCount }, (_, i) => i + 1).map(t => (
                            <option key={t} value={t}>Table {t}</option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'list' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Guest', 'Meal', 'RSVP', 'Table', ''].map(h => (
                  <th key={h} style={thStyle}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F9F6F0' }}
                  onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ ...cellStyle, fontWeight: 500, color: '#2C2416' }}>
                    <InlineEdit value={g.name} onChange={val => updateGuest(i, 'name', val)} />
                  </td>
                  <td style={{ ...cellStyle, color: '#7A6E5C' }}>
                    <InlineEdit value={g.meal} onChange={val => updateGuest(i, 'meal', val)} options={MEAL_OPTIONS} />
                  </td>
                  <td style={cellStyle}>
                    <InlineEdit value={g.rsvp} onChange={val => updateGuest(i, 'rsvp', val)} options={RSVP_STATUSES} />
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={g.table}
                      onChange={e => updateGuest(i, 'table', e.target.value)}
                      style={{ border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', color: '#2C2416', cursor: 'pointer' }}
                    >
                      <option value="">Unassigned</option>
                      {Array.from({ length: tableCount }, (_, idx) => idx + 1).map(t => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <button onClick={() => deleteGuest(i)} title="Delete" style={{ background: 'none', border: 'none', color: '#D4B8A8', fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }}>✕</button>
                  </td>
                </tr>
              ))}

              {addingGuest && (
                <tr style={{ background: '#FDFCF9', borderBottom: '1px solid #F0EDE8' }}>
                  <td style={cellStyle}><input style={addRowInputStyle} placeholder="Guest name" value={newGuest.name} onChange={e => setNewGuest(g => ({ ...g, name: e.target.value }))} autoFocus /></td>
                  <td style={cellStyle}>
                    <select style={addRowInputStyle} value={newGuest.meal} onChange={e => setNewGuest(g => ({ ...g, meal: e.target.value }))}>
                      {MEAL_OPTIONS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <select style={addRowInputStyle} value={newGuest.rsvp} onChange={e => setNewGuest(g => ({ ...g, rsvp: e.target.value }))}>
                      {RSVP_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={cellStyle}>
                    <select style={addRowInputStyle} value={newGuest.table} onChange={e => setNewGuest(g => ({ ...g, table: e.target.value }))}>
                      <option value="">Unassigned</option>
                      {Array.from({ length: tableCount }, (_, i) => i + 1).map(t => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ ...cellStyle, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button onClick={saveNewGuest} style={{ background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setAddingGuest(false)} style={{ background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {view === 'list' && (
          <div style={{ padding: '12px 24px', background: '#FDFCF9', borderTop: '1px solid #F0EDE8' }}>
            <span style={{ fontSize: 12, color: '#A89880' }}>{guests.length} guests · {unassigned.length} unassigned</span>
          </div>
        )}
      </div>
    </div>
  )
}
