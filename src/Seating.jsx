import { useState } from 'react'

const stepBtn = {
  width: 26, height: 26, borderRadius: 6, border: '1px solid #E0D4C0', background: 'white',
  color: '#7A6E5C', cursor: 'pointer', fontSize: 14, lineHeight: 1,
}

const cardStyle = { background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }

function guestName(row) {
  return [row.firstName, row.lastName].filter(Boolean).join(' ') || 'Guest'
}

function TableVisual({ tableNumber, guestsAtTable, capacity }) {
  const size = 200
  const center = size / 2
  const radius = 74
  const seatW = 66
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
            title={guest ? guestName(guest) : `Seat ${i + 1} (open)`}
            style={{
              position: 'absolute', left: x, top: y, width: seatW, height: seatH,
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, padding: '0 6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              background: guest ? '#EAF4EE' : '#F5F0E8',
              border: guest ? '1px solid #9CC2AA' : '1px dashed #E0D4C0',
              color: guest ? '#2E6E4A' : '#C0B4A0',
            }}
          >
            {guest ? guestName(guest) : 'Open'}
          </div>
        )
      })}
    </div>
  )
}

export default function Seating({ sheet, seating, setSeating }) {
  const [view, setView] = useState('chart')
  const { rows } = sheet
  const { assignments, tableCount, capacity } = seating

  const bumpTableCount = (delta) => setSeating(s => ({ ...s, tableCount: Math.max(1, s.tableCount + delta) }))
  const bumpCapacity = (delta) => setSeating(s => ({ ...s, capacity: Math.max(2, s.capacity + delta) }))
  const assign = (rowId, table) => setSeating(s => ({ ...s, assignments: { ...s.assignments, [rowId]: table } }))

  const guests = rows.map(r => ({ ...r, table: assignments[r.id] || '' }))
  const unassigned = guests.filter(g => !g.table)
  const seated = guests.length - unassigned.length

  if (rows.length === 0) {
    return (
      <div style={cardStyle}>
        <div className="serif" style={{ fontSize: 20, marginBottom: 6 }}>No guests yet</div>
        <p style={{ fontSize: 13, color: '#A89880' }}>Add guests in the Guest List tab first, then come back here to seat them.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>TOTAL GUESTS</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{guests.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>SEATED</div>
          <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{seated}</div>
        </div>
        <div style={cardStyle}>
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
                  <button style={stepBtn} onClick={() => bumpTableCount(-1)}>−</button>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{tableCount}</span>
                  <button style={stepBtn} onClick={() => bumpTableCount(1)}>+</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#7A6E5C' }}>Seats/table</span>
                  <button style={stepBtn} onClick={() => bumpCapacity(-1)}>−</button>
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{capacity}</span>
                  <button style={stepBtn} onClick={() => bumpCapacity(1)}>+</button>
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
                  {unassigned.map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FDFCF9', border: '1px solid #F0EDE8', borderRadius: 20, padding: '6px 8px 6px 14px' }}>
                      <span style={{ fontSize: 13, color: '#2C2416' }}>{guestName(g)}</span>
                      <select
                        value={g.table}
                        onChange={e => assign(g.id, e.target.value)}
                        style={{ fontSize: 11, border: '1px solid #E0D4C0', borderRadius: 12, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', background: 'white' }}
                      >
                        <option value="">Seat…</option>
                        {Array.from({ length: tableCount }, (_, i) => i + 1).map(t => (
                          <option key={t} value={t}>Table {t}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'list' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Guest', 'Table', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.1em', borderBottom: '1px solid #F0EDE8', background: '#FDFCF9' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #F9F6F0' }}
                  onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#2C2416' }}>{guestName(g)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <select
                      value={g.table}
                      onChange={e => assign(g.id, e.target.value)}
                      style={{ border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', color: '#2C2416', cursor: 'pointer' }}
                    >
                      <option value="">Unassigned</option>
                      {Array.from({ length: tableCount }, (_, i) => i + 1).map(t => (
                        <option key={t} value={t}>Table {t}</option>
                      ))}
                    </select>
                  </td>
                  <td />
                </tr>
              ))}
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
