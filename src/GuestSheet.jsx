import { useState } from 'react'
import { nextId } from './data'

function emptyRow(columns) {
  const row = { id: nextId() }
  columns.forEach(c => { row[c.key] = '' })
  return row
}

export default function GuestSheet({ sheet, setSheet }) {
  const { columns, rows } = sheet
  const [addingCol, setAddingCol] = useState(false)
  const [newColName, setNewColName] = useState('')

  const updateCell = (rowId, key, val) => {
    setSheet(s => ({ ...s, rows: s.rows.map(r => r.id === rowId ? { ...r, [key]: val } : r) }))
  }

  const addRow = () => {
    setSheet(s => ({ ...s, rows: [...s.rows, emptyRow(s.columns)] }))
  }

  const removeRow = (rowId) => {
    setSheet(s => ({ ...s, rows: s.rows.filter(r => r.id !== rowId) }))
  }

  const addColumn = () => {
    const label = newColName.trim()
    if (!label) { setAddingCol(false); return }
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `field_${columns.length}`
    setSheet(s => ({
      columns: [...s.columns, { key, label }],
      rows: s.rows.map(r => ({ ...r, [key]: '' })),
    }))
    setNewColName('')
    setAddingCol(false)
  }

  const removeColumn = (key) => {
    setSheet(s => ({
      columns: s.columns.filter(c => c.key !== key),
      rows: s.rows.map(r => { const { [key]: _, ...rest } = r; return rest }),
    }))
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Guest List</div>
          <div style={{ fontSize: 12, color: '#A89880', marginTop: 2 }}>{rows.length} guest{rows.length === 1 ? '' : 's'} total</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addRow} style={addBtn}>+ Add Guest</button>
          <button onClick={() => setAddingCol(true)} style={ghostBtn}>+ Add Field</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 44, textAlign: 'center' }}>#</th>
              {columns.map(c => (
                <th key={c.key} style={thStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.label.toUpperCase()}
                    <button onClick={() => removeColumn(c.key)} title="Remove field" style={removeColBtn}>✕</button>
                  </div>
                </th>
              ))}
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F9F6F0' }}
                onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                <td style={{ ...cellStyle, textAlign: 'center', color: '#A89880' }}>{i + 1}</td>
                {columns.map(c => (
                  <td key={c.key} style={cellStyle}>
                    <input
                      value={row[c.key] ?? ''}
                      onChange={e => updateCell(row.id, c.key, e.target.value)}
                      placeholder="—"
                      style={inputStyle}
                    />
                  </td>
                ))}
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <button onClick={() => removeRow(row.id)} title="Delete" style={deleteBtn}>✕</button>
                </td>
              </tr>
            ))}

            {addingCol && (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '12px 24px', background: '#FDFCF9' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      autoFocus
                      value={newColName}
                      onChange={e => setNewColName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addColumn(); if (e.key === 'Escape') setAddingCol(false) }}
                      placeholder="New field name, e.g. Plus One"
                      style={{ ...inputStyle, width: 220 }}
                    />
                    <button onClick={addColumn} style={saveBtn}>Add</button>
                    <button onClick={() => { setAddingCol(false); setNewColName('') }} style={cancelBtn}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {rows.length === 0 && !addingCol && (
              <tr><td colSpan={columns.length + 2} style={{ padding: 40, textAlign: 'center', color: '#A89880', fontSize: 13 }}>
                No guests yet — click "+ Add Guest" to start your list.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const cellStyle = { padding: '6px 10px', fontSize: 13, whiteSpace: 'nowrap' }
const thStyle = { padding: '11px 10px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.06em', borderBottom: '1px solid #F0EDE8', background: '#FDFCF9', whiteSpace: 'nowrap' }
const inputStyle = { border: '1px solid transparent', borderRadius: 6, padding: '7px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'transparent', width: 150, boxSizing: 'border-box', outline: 'none' }
const addBtn = { background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const ghostBtn = { background: 'white', color: '#2C2416', border: '1px solid #E0D4C0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const deleteBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }
const removeColBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: 1 }
const saveBtn = { background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const cancelBtn = { background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }
