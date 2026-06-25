import { useState, useRef, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { nextId, COLOR_PALETTE, SUGGESTED_FIELDS } from './data'

function emptyRow(columns) {
  const row = { id: nextId(), notes: '' }
  columns.forEach(c => { row[c.key] = '' })
  return row
}

function selectedOption(column, value) {
  return (column.options || []).find(o => o.value === value)
}

function Cell({ value, column, onChange, onKeyDown, onPaste, inputRef }) {
  if (column.type === 'select') {
    const opt = selectedOption(column, value)
    return (
      <select
        ref={inputRef}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        style={{ ...selectStyle, background: opt?.color || 'transparent' }}
      >
        <option value="">—</option>
        {(column.options || []).map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
      </select>
    )
  }
  return (
    <input
      ref={inputRef}
      type={column.type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      placeholder="—"
      style={inputStyle}
    />
  )
}

function Popover({ rect, children, width }) {
  const ref = useRef(null)
  if (!rect) return null
  const style = {
    position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 1000,
    background: 'white', border: '1px solid #E8DCC8', borderRadius: 8, padding: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)', minWidth: width || 220, maxWidth: 320,
  }
  return createPortal(
    <div ref={ref} style={style} data-popover>{children}</div>,
    document.body
  )
}

function FieldEditor({ initial, onSave, onCancel, title, showSuggestions }) {
  const [label, setLabel] = useState(initial?.label || '')
  const [type, setType] = useState(initial?.type || 'text')
  const [options, setOptions] = useState(initial?.options?.length ? initial.options : [])

  const addOption = () => setOptions(prev => [...prev, { value: '', color: COLOR_PALETTE[prev.length % COLOR_PALETTE.length] }])
  const updateOption = (i, patch) => setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, ...patch } : o))
  const removeOption = (i) => setOptions(prev => prev.filter((_, idx) => idx !== i))

  const save = () => {
    const trimmed = label.trim()
    if (!trimmed) { onCancel(); return }
    const cleanOptions = options.map(o => ({ value: o.value.trim(), color: o.color })).filter(o => o.value)
    onSave({ label: trimmed, type, options: type === 'select' ? cleanOptions : [] })
  }

  const applySuggestion = (s) => {
    onSave({ label: s.label, type: s.type, options: s.options })
  }

  return (
    <>
      <div style={{ fontSize: 11, color: '#A89880', fontWeight: 500, marginBottom: 10 }}>{title}</div>

      {showSuggestions && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#A89880', marginBottom: 6 }}>SUGGESTED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED_FIELDS.map(s => (
              <button key={s.label} onClick={() => applySuggestion(s)} style={suggestionChip}>{s.label}</button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #F0EDE8', margin: '10px 0' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          autoFocus
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
          placeholder="Field name, e.g. Plus One"
          style={{ ...inputStyle, width: '100%', border: '1px solid #E0D4C0', padding: '7px 8px' }}
        />
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...selectStyle, width: '100%', border: '1px solid #E0D4C0', padding: '7px 8px' }}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="select">Dropdown list</option>
        </select>
        {type === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {options.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="color"
                  value={o.color}
                  onChange={e => updateOption(i, { color: e.target.value })}
                  style={{ width: 26, height: 26, border: 'none', padding: 0, cursor: 'pointer' }}
                />
                <input
                  value={o.value}
                  onChange={e => updateOption(i, { value: e.target.value })}
                  placeholder="Option name"
                  style={{ ...inputStyle, flex: 1, border: '1px solid #E0D4C0', padding: '6px 8px' }}
                />
                <button onClick={() => removeOption(i)} style={removeColBtn}>✕</button>
              </div>
            ))}
            <button onClick={addOption} style={cancelBtn}>+ Add option</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={save} style={saveBtn}>Save</button>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        </div>
      </div>
    </>
  )
}

function FilterPanel({ column, values, active, onApply, onClose }) {
  const [checked, setChecked] = useState(active ?? new Set(values))

  const toggle = (v) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v); else next.add(v)
      return next
    })
  }

  return (
    <>
      <div style={{ fontSize: 11, color: '#A89880', fontWeight: 500, marginBottom: 8 }}>FILTER {column.label.toUpperCase()}</div>
      <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {values.length === 0 && <div style={{ fontSize: 12, color: '#A89880' }}>No values yet</div>}
        {values.map(v => (
          <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={checked.has(v)} onChange={() => toggle(v)} />
            {v || '(blank)'}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button onClick={() => onApply(checked)} style={saveBtn}>Apply</button>
        <button onClick={() => onApply(null)} style={cancelBtn}>Clear</button>
        <button onClick={onClose} style={cancelBtn}>Close</button>
      </div>
    </>
  )
}

function RowDetailPanel({ row, columns, onChange, onClose }) {
  const titleParts = [row.firstName, row.lastName].filter(Boolean)
  const title = titleParts.join(' ') || 'Guest'

  return createPortal(
    <div style={detailOverlay} onMouseDown={onClose}>
      <div style={detailPanel} onMouseDown={e => e.stopPropagation()} data-popover>
        <button onClick={onClose} style={detailCloseBtn} title="Close">✕</button>
        <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#A89880', marginBottom: 24 }}>Guest details</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {columns.map(c => (
            <div key={c.key}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: '#B89A6A', fontWeight: 500, marginBottom: 6 }}>
                {c.label.toUpperCase()}
              </label>
              <Cell
                value={row[c.key]}
                column={c}
                onChange={val => onChange(c.key, val)}
                onKeyDown={() => {}}
                onPaste={() => {}}
                inputRef={() => {}}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', color: '#B89A6A', fontWeight: 500, marginBottom: 6 }}>
              NOTES
            </label>
            <textarea
              value={row.notes || ''}
              onChange={e => onChange('notes', e.target.value)}
              placeholder="Write a note about this guest…"
              style={notesStyle}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function GuestSheet({ sheet, setSheet }) {
  const { columns, rows } = sheet
  // popover = { type: 'filter' | 'edit' | 'add', key, rect }
  const [popover, setPopover] = useState(null)
  const [sort, setSort] = useState(null) // { key, dir: 'asc' | 'desc' }
  const [filters, setFilters] = useState({}) // { [key]: Set(values) }
  const [undoAction, setUndoAction] = useState(null) // { message, undo }
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [detailRowId, setDetailRowId] = useState(null)
  const [bulkField, setBulkField] = useState({ key: '', value: '' })
  const cellRefs = useRef({})
  const undoTimerRef = useRef(null)

  useEffect(() => {
    if (!popover) return
    const handleClick = (e) => {
      if (e.target.closest('[data-popover]')) return
      setPopover(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [popover])

  const openPopover = (e, type, key) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setPopover(prev => (prev?.type === type && prev?.key === key) ? null : { type, key, rect })
  }

  const flashUndo = (message, undo) => {
    clearTimeout(undoTimerRef.current)
    setUndoAction({ message, undo })
    undoTimerRef.current = setTimeout(() => setUndoAction(null), 8000)
  }

  const setCellRef = (rowId, colKey, el) => {
    cellRefs.current[`${rowId}:${colKey}`] = el
  }
  const focusCell = (rowId, colKey) => {
    requestAnimationFrame(() => cellRefs.current[`${rowId}:${colKey}`]?.focus())
  }

  const updateCell = (rowId, key, val) => {
    setSheet(s => ({ ...s, rows: s.rows.map(r => r.id === rowId ? { ...r, [key]: val } : r) }))
  }

  const addRow = () => {
    const row = emptyRow(columns)
    setSheet(s => ({ ...s, rows: [...s.rows, row] }))
    return row
  }

  const removeRow = (rowId) => {
    const index = rows.findIndex(r => r.id === rowId)
    const removed = rows[index]
    setSheet(s => ({ ...s, rows: s.rows.filter(r => r.id !== rowId) }))
    flashUndo('Guest removed.', () => {
      setSheet(s => {
        const next = [...s.rows]
        next.splice(index, 0, removed)
        return { ...s, rows: next }
      })
    })
  }

  const removeSelectedRows = () => {
    const ids = new Set(selectedIds)
    const removedEntries = rows.map((r, i) => ({ r, i })).filter(({ r }) => ids.has(r.id))
    setSheet(s => ({ ...s, rows: s.rows.filter(r => !ids.has(r.id)) }))
    setSelectedIds(new Set())
    flashUndo(`${removedEntries.length} guest${removedEntries.length === 1 ? '' : 's'} removed.`, () => {
      setSheet(s => {
        const next = [...s.rows]
        removedEntries.forEach(({ r, i }) => next.splice(Math.min(i, next.length), 0, r))
        return { ...s, rows: next }
      })
    })
  }

  const applyBulkField = () => {
    if (!bulkField.key) return
    const ids = new Set(selectedIds)
    setSheet(s => ({ ...s, rows: s.rows.map(r => ids.has(r.id) ? { ...r, [bulkField.key]: bulkField.value } : r) }))
    setBulkField({ key: '', value: '' })
  }

  const toggleRowSelected = (rowId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.size === visibleRows.length ? new Set() : new Set(visibleRows.map(({ r }) => r.id)))
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
    setPopover(null)
  }

  const saveColumnEdit = (key, { label, type, options }) => {
    setSheet(s => ({
      ...s,
      columns: s.columns.map(c => c.key === key ? { ...c, label, type, options } : c),
    }))
    setPopover(null)
  }

  const removeColumn = (key) => {
    const index = columns.findIndex(c => c.key === key)
    const removedColumn = columns[index]
    const removedValues = rows.map(r => r[key])
    setSheet(s => ({
      columns: s.columns.filter(c => c.key !== key),
      rows: s.rows.map(r => { const { [key]: _, ...rest } = r; return rest }),
    }))
    setFilters(f => { const { [key]: _, ...rest } = f; return rest })
    if (sort?.key === key) setSort(null)
    flashUndo(`Field "${removedColumn.label}" removed.`, () => {
      setSheet(s => {
        const cols = [...s.columns]
        cols.splice(index, 0, removedColumn)
        return {
          columns: cols,
          rows: s.rows.map((r, i) => ({ ...r, [key]: removedValues[i] ?? '' })),
        }
      })
    })
  }

  const toggleSort = (key) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const distinctValues = (key) => {
    const vals = new Set(rows.map(r => String(r[key] ?? '')))
    return Array.from(vals).sort((a, b) => a.localeCompare(b))
  }

  const visibleRows = useMemo(() => {
    let result = rows.map((r, i) => ({ r, originalIndex: i }))
    Object.entries(filters).forEach(([key, allowed]) => {
      if (!allowed) return
      result = result.filter(({ r }) => allowed.has(String(r[key] ?? '')))
    })
    if (sort) {
      const { key, dir } = sort
      const col = columns.find(c => c.key === key)
      result = [...result].sort((a, b) => {
        const av = a.r[key] ?? '', bv = b.r[key] ?? ''
        let cmp
        if (col?.type === 'number') cmp = (parseFloat(av) || 0) - (parseFloat(bv) || 0)
        else cmp = String(av).localeCompare(String(bv))
        return dir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [rows, filters, sort, columns])

  const colOrder = columns.map(c => c.key)
  const handleCellKeyDown = (e, row, colKey) => {
    const ci = colOrder.indexOf(colKey)
    const ri = visibleRows.findIndex(({ r }) => r.id === row.id)

    if (e.key === 'Enter') {
      e.preventDefault()
      const isLastVisibleRow = ri === visibleRows.length - 1
      if (isLastVisibleRow) {
        const newRow = addRow()
        focusCell(newRow.id, colKey)
      } else {
        const nextRow = visibleRows[ri + 1].r
        focusCell(nextRow.id, colKey)
      }
      return
    }

    const isTextInput = e.target.tagName === 'INPUT'
    const atStart = !isTextInput || e.target.selectionStart === 0
    const atEnd = !isTextInput || e.target.selectionEnd === e.target.value.length

    if (e.key === 'ArrowDown' && ri < visibleRows.length - 1) {
      e.preventDefault()
      focusCell(visibleRows[ri + 1].r.id, colKey)
    } else if (e.key === 'ArrowUp' && ri > 0) {
      e.preventDefault()
      focusCell(visibleRows[ri - 1].r.id, colKey)
    } else if (e.key === 'ArrowLeft' && atStart && ci > 0) {
      e.preventDefault()
      focusCell(row.id, colOrder[ci - 1])
    } else if (e.key === 'ArrowRight' && atEnd && ci < colOrder.length - 1) {
      e.preventDefault()
      focusCell(row.id, colOrder[ci + 1])
    }
  }

  const handleCellPaste = (e, row, colKey) => {
    const text = e.clipboardData.getData('text')
    if (!text.includes('\t') && !text.includes('\n')) return
    e.preventDefault()
    const grid = text.replace(/\r/g, '').split('\n').filter((line, i, arr) => !(i === arr.length - 1 && line === '')).map(line => line.split('\t'))
    const startRi = visibleRows.findIndex(({ r }) => r.id === row.id)
    const startCi = colOrder.indexOf(colKey)

    setSheet(s => {
      let nextRows = [...s.rows]
      const visibleSnapshot = visibleRows.map(({ r }) => r.id)
      grid.forEach((line, gi) => {
        const targetIndex = startRi + gi
        let targetId
        if (targetIndex < visibleSnapshot.length) {
          targetId = visibleSnapshot[targetIndex]
        } else {
          const newRow = emptyRow(s.columns)
          nextRows = [...nextRows, newRow]
          targetId = newRow.id
        }
        const updates = {}
        line.forEach((val, ci) => {
          const col = s.columns[startCi + ci]
          if (col) updates[col.key] = val
        })
        nextRows = nextRows.map(r => r.id === targetId ? { ...r, ...updates } : r)
      })
      return { ...s, rows: nextRows }
    })
  }

  const startFromBlank = () => {
    const row = addRow()
    focusCell(row.id, columns[0]?.key)
  }

  const detailRow = detailRowId ? rows.find(r => r.id === detailRowId) : null

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Guest List</div>
          <div style={{ fontSize: 12, color: '#A89880', marginTop: 2 }}>{rows.length} guest{rows.length === 1 ? '' : 's'} total</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addRow} style={addBtn}>+ Add Guest</button>
          <button onClick={e => openPopover(e, 'add', null)} style={ghostBtn}>+ Add Field</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 36, textAlign: 'center' }}>
                <input type="checkbox" checked={selectedIds.size > 0 && selectedIds.size === visibleRows.length} onChange={toggleSelectAll} />
              </th>
              <th style={{ ...thStyle, width: 44, textAlign: 'center' }}>#</th>
              {columns.map(c => (
                <th key={c.key} style={thStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.label.toUpperCase()}
                    <button onClick={e => { e.stopPropagation(); toggleSort(c.key) }} title="Sort A–Z" style={removeColBtn}>
                      {sort?.key === c.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                    <button onClick={e => openPopover(e, 'filter', c.key)} title="Filter" style={{ ...removeColBtn, color: filters[c.key] ? '#7A8C6E' : '#D4B8A8' }}>▽</button>
                    <button onClick={e => openPopover(e, 'edit', c.key)} title="Edit field" style={removeColBtn}>⚙</button>
                    <button onClick={e => { e.stopPropagation(); removeColumn(c.key) }} title="Remove field" style={removeColBtn}>✕</button>
                  </div>
                </th>
              ))}
              <th style={thStyle}></th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ r: row }, i) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F9F6F0', background: selectedIds.has(row.id) ? '#FBF8F0' : 'white' }}
                onMouseOver={e => { if (!selectedIds.has(row.id)) e.currentTarget.style.background = '#FDFCF9' }}
                onMouseOut={e => { if (!selectedIds.has(row.id)) e.currentTarget.style.background = 'white' }}>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRowSelected(row.id)} />
                </td>
                <td style={{ ...cellStyle, textAlign: 'center', color: '#A89880' }}>{i + 1}</td>
                {columns.map(c => (
                  <td key={c.key} style={cellStyle}>
                    <Cell
                      value={row[c.key]}
                      column={c}
                      onChange={val => updateCell(row.id, c.key, val)}
                      onKeyDown={e => handleCellKeyDown(e, row, c.key)}
                      onPaste={e => handleCellPaste(e, row, c.key)}
                      inputRef={el => setCellRef(row.id, c.key, el)}
                    />
                  </td>
                ))}
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <button onClick={() => setDetailRowId(row.id)} title="Open guest details" style={expandBtn}>⤢</button>
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <button onClick={() => removeRow(row.id)} title="Delete" style={deleteBtn}>✕</button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 4} onClick={startFromBlank} style={{ padding: 48, textAlign: 'center', color: '#A89880', fontSize: 13, cursor: 'text' }}>
                  Click anywhere here to start typing your guest list…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {popover?.type === 'filter' && (
        <Popover rect={popover.rect}>
          <FilterPanel
            column={columns.find(c => c.key === popover.key)}
            values={distinctValues(popover.key)}
            active={filters[popover.key]}
            onApply={(checked) => {
              setFilters(f => {
                if (checked === null) { const { [popover.key]: _, ...rest } = f; return rest }
                return { ...f, [popover.key]: checked }
              })
              setPopover(null)
            }}
            onClose={() => setPopover(null)}
          />
        </Popover>
      )}

      {popover?.type === 'edit' && (
        <Popover rect={popover.rect} width={260}>
          <FieldEditor
            title="EDIT FIELD"
            initial={columns.find(c => c.key === popover.key)}
            onSave={vals => saveColumnEdit(popover.key, vals)}
            onCancel={() => setPopover(null)}
          />
        </Popover>
      )}

      {popover?.type === 'add' && (
        <Popover rect={popover.rect} width={280}>
          <FieldEditor
            title="NEW FIELD"
            showSuggestions
            onSave={addColumn}
            onCancel={() => setPopover(null)}
          />
        </Popover>
      )}

      {detailRow && (
        <RowDetailPanel
          row={detailRow}
          columns={columns}
          onChange={(key, val) => updateCell(detailRow.id, key, val)}
          onClose={() => setDetailRowId(null)}
        />
      )}

      {selectedIds.size > 0 && createPortal(
        <div style={bulkBar} data-popover>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedIds.size} selected</span>
          <select value={bulkField.key} onChange={e => setBulkField({ key: e.target.value, value: '' })} style={{ ...selectStyle, border: '1px solid #E0D4C0', background: 'white' }}>
            <option value="">Set field…</option>
            {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          {bulkField.key && (
            <Cell
              value={bulkField.value}
              column={columns.find(c => c.key === bulkField.key)}
              onChange={val => setBulkField(f => ({ ...f, value: val }))}
              onKeyDown={() => {}}
              onPaste={() => {}}
              inputRef={() => {}}
            />
          )}
          {bulkField.key && <button onClick={applyBulkField} style={saveBtn}>Apply to all</button>}
          <button onClick={removeSelectedRows} style={bulkDeleteBtn}>Delete</button>
          <button onClick={() => setSelectedIds(new Set())} style={cancelBtn}>Clear selection</button>
        </div>,
        document.body
      )}

      {undoAction && createPortal(
        <div style={undoToast}>
          <span>{undoAction.message}</span>
          <button
            onClick={() => { undoAction.undo(); setUndoAction(null) }}
            style={undoBtn}
          >
            Undo
          </button>
        </div>,
        document.body
      )}
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
const expandBtn = { background: 'none', border: 'none', color: '#B89A6A', fontSize: 13, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }
const removeColBtn = { background: 'none', border: 'none', color: '#D4B8A8', fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: 1 }
const saveBtn = { background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const cancelBtn = { background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }
const bulkDeleteBtn = { background: '#C4614A', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }
const suggestionChip = { background: '#FDFCF9', border: '1px solid #E0D4C0', color: '#2C2416', borderRadius: 14, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }
const undoToast = {
  position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1100,
  background: '#2C2416', color: '#F9F6F0', borderRadius: 10, padding: '12px 18px',
  display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
}
const undoBtn = {
  background: 'none', border: '1px solid rgba(249,246,240,0.4)', color: '#F9F6F0',
  borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
}
const bulkBar = {
  position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1100,
  background: 'white', border: '1px solid #E8DCC8', borderRadius: 10, padding: '10px 16px',
  display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
}
const detailOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(44,36,22,0.25)',
  zIndex: 1200, display: 'flex', justifyContent: 'flex-end',
}
const detailPanel = {
  width: 420, maxWidth: '90vw', height: '100%', background: '#FDFCF9', boxShadow: '-12px 0 32px rgba(0,0,0,0.18)',
  padding: '32px 28px', overflowY: 'auto', position: 'relative', boxSizing: 'border-box',
}
const detailCloseBtn = {
  position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 16,
  color: '#A89880', cursor: 'pointer', lineHeight: 1,
}
const notesStyle = {
  width: '100%', minHeight: 100, border: '1px solid #E0D4C0', borderRadius: 8, padding: '10px 12px',
  fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
}
