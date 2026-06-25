import { useState, useRef } from 'react'
import { nextId } from './data'

function emptyRow(columns) {
  const row = { id: nextId() }
  columns.forEach(c => { row[c.key] = '' })
  return row
}

function Cell({ value, column, onChange, onEnter, inputRef }) {
  if (column.type === 'select') {
    return (
      <select value={value ?? ''} onChange={e => onChange(e.target.value)} style={selectStyle}>
        <option value="">—</option>
        {(column.options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      ref={inputRef}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEnter() } }}
      placeholder="—"
      style={inputStyle}
    />
  )
}

function FieldEditor({ initial, onSave, onCancel }) {
  const [label, setLabel] = useState(initial?.label || '')
  const [type, setType] = useState(initial?.type || 'text')
  const [optionsText, setOptionsText] = useState((initial?.options || []).join(', '))

  const save = () => {
    const trimmed = label.trim()
    if (!trimmed) { onCancel(); return }
    const options = optionsText.split(',').map(o => o.trim()).filter(Boolean)
    onSave({ label: trimmed, type, options: type === 'select' ? options : [] })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <input
        autoFocus
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Field name, e.g. Plus One"
        style={{ ...inputStyle, width: 200, border: '1px solid #E0D4C0', padding: '7px 8px' }}
      />
      <select value={type} onChange={e => setType(e.target.value)} style={{ ...selectStyle, border: '1px solid #E0D4C0', padding: '7px 8px' }}>
        <option value="text">Text</option>
        <option value="select">Dropdown list</option>
      </select>
      {type === 'select' && (
        <input
          value={optionsText}
          onChange={e => setOptionsText(e.target.value)}
          placeholder="Options, comma separated, e.g. Tier 0, Tier 1, Tier 2"
          style={{ ...inputStyle, width: 280, border: '1px solid #E0D4C0', padding: '7px 8px' }}
        />
      )}
      <button onClick={save} style={saveBtn}>Save</button>
      <button onClick={onCancel} style={cancelBtn}>Cancel</button>
    </div>
  )
}

export default function GuestSheet({ sheet, setSheet }) {
  const { columns, rows } = sheet
  const [addingCol, setAddingCol] = useState(false)
  const [editingColKey, setEditingColKey] = useState(null)
  const lastInputRef = useRef(null)

  const updateCell = (rowId, key, val) => {
    setSheet(s => ({ ...s, rows: s.rows.map(r => r.id === rowId ? { ...r, [key]: val } : r) }))
  }

  const addRow = (focusAfter) => {
    const row = emptyRow(columns)
    setSheet(s => ({ ...s, rows: [...s.rows, row] }))
    if (focusAfter) {
      requestAnimationFrame(() => lastInputRef.current?.focus())
    }
  }

  const removeRow = (rowId) => {
    setSheet(s => ({ ...s, rows: s.rows.filter(r => r.id !== rowId) }))
  }

  const addColumn = ({ label, type, options }) => {
    const existingKeys = new Set(columns.map(c => c.key))
    let key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `field`
    let suffix = 1
    while (existingKeys.has(key)) { key = `${key}_${suffix++}` }
    setSheet(s => ({
      columns: [...s.columns, { key, label, type, options }],
      rows: s.rows.map(r => ({ ...r, [key]: '' })),
    }))
    setAddingCol(false)
  }

  const saveColumnEdit = (key, { label, type, options }) => {
    setSheet(s => ({
      ...s,
      columns: s.columns.map(c => c.key === key ? { ...c, label, type, options } : c),
    }))
    setEditingColKey(null)
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
          <button onClick={() => addRow(false)} style={addBtn}>+ Add Guest</button>
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
                    <button onClick={() => setEditingColKey(c.key)} title="Edit field" style={removeColBtn}>⚙</button>
                    <button onClick={() => removeColumn(c.key)} title="Remove field" style={removeColBtn}>✕</button>
                  </div>
                </th>
              ))}
              <th style={thStyle}></th>
            </tr>
            {editingColKey && (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '12px 24px', background: '#FDFCF9' }}>
                  <FieldEditor
                    initial={columns.find(c => c.key === editingColKey)}
                    onSave={vals => saveColumnEdit(editingColKey, vals)}
                    onCancel={() => setEditingColKey(null)}
                  />
                </td>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isLastRow = i === rows.length - 1
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid #F9F6F0' }}
                  onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#A89880' }}>{i + 1}</td>
                  {columns.map((c, ci) => (
                    <td key={c.key} style={cellStyle}>
                      <Cell
                        value={row[c.key]}
                        column={c}
                        onChange={val => updateCell(row.id, c.key, val)}
                        onEnter={() => addRow(isLastRow)}
                        inputRef={isLastRow && ci === columns.length - 1 ? lastInputRef : null}
                      />
                    </td>
                  ))}
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <button onClick={() => removeRow(row.id)} title="Delete" style={deleteBtn}>✕</button>
                  </td>
                </tr>
              )
            })}

            {addingCol && (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '12px 24px', background: '#FDFCF9' }}>
                  <FieldEditor onSave={addColumn} onCancel={() => setAddingCol(false)} />
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
const selectStyle = { ...inputStyle, cursor: 'pointer' }
const addBtn = { background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const ghostBtn = { background: 'white', color: '#2C2416', border: '1px solid #E0D4C0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const deleteBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }
const removeColBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: 1 }
const saveBtn = { background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const cancelBtn = { background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }
