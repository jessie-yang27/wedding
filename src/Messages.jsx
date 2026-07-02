import { useState, useMemo } from 'react'
import { nextId, MESSAGE_TEMPLATES } from './data'

const MERGE_FIELDS = ['firstName', 'lastName', 'coupleName', 'weddingDate', 'venue']

const SUB_TABS = [
  { key: 'compose', label: 'Compose' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'sent', label: 'Sent' },
]

const inputStyle = {
  border: '1px solid #E0D4C0', borderRadius: 6, padding: '8px 10px', fontSize: 13,
  fontFamily: 'Jost, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontSize: 11, letterSpacing: '0.08em', color: '#B89A6A', fontWeight: 500, marginBottom: 6,
}

const chipBtn = {
  border: '1px solid #E0D4C0', borderRadius: 999, padding: '4px 12px', fontSize: 12,
  background: '#fff', cursor: 'pointer', color: '#5A4F3A',
}

const primaryBtn = {
  border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 500,
  background: '#B89A6A', color: '#fff', cursor: 'pointer',
}

const secondaryBtn = {
  border: '1px solid #E0D4C0', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 500,
  background: '#fff', color: '#5A4F3A', cursor: 'pointer',
}

function fillTemplate(text, info, row) {
  if (!text) return text
  return text
    .replace(/\{\{firstName\}\}/g, row?.firstName || '')
    .replace(/\{\{lastName\}\}/g, row?.lastName || '')
    .replace(/\{\{coupleName\}\}/g, info.coupleName || '')
    .replace(/\{\{weddingDate\}\}/g, info.weddingDate || '')
    .replace(/\{\{venue\}\}/g, info.venue || '')
}

function emptyDraft(type = 'email') {
  return { id: null, type, subject: '', body: '', recipientIds: [] }
}

export default function Messages({ info, sheet, messages, setMessages }) {
  const [subTab, setSubTab] = useState('compose')
  const [draft, setDraft] = useState(emptyDraft())
  const [insertAt, setInsertAt] = useState({ field: 'body' })

  const { columns, rows } = sheet
  const textColumns = columns.filter(c => c.type === 'text')

  const emailColumn = columns.find(c => c.key === messages.emailColumnKey)
  const phoneColumn = columns.find(c => c.key === messages.phoneColumnKey)
  const activeColumn = draft.type === 'email' ? emailColumn : phoneColumn

  const eligibleRows = useMemo(() => {
    if (!activeColumn) return []
    return rows.filter(r => (r[activeColumn.key] || '').trim())
  }, [rows, activeColumn])

  const allEligibleSelected = eligibleRows.length > 0 && eligibleRows.every(r => draft.recipientIds.includes(r.id))

  function setColumnMapping(field, key) {
    setMessages(prev => ({ ...prev, [field]: key }))
  }

  function toggleRecipient(id) {
    setDraft(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(id)
        ? prev.recipientIds.filter(x => x !== id)
        : [...prev.recipientIds, id],
    }))
  }

  function toggleSelectAllEligible() {
    setDraft(prev => ({
      ...prev,
      recipientIds: allEligibleSelected ? [] : eligibleRows.map(r => r.id),
    }))
  }

  function insertField(field) {
    setDraft(prev => ({ ...prev, [insertAt.field]: (prev[insertAt.field] || '') + `{{${field}}}` }))
  }

  function applyTemplate(t) {
    setDraft(prev => ({ ...prev, type: t.type, subject: t.subject || '', body: t.body }))
  }

  function saveDraft() {
    if (!draft.body.trim()) return
    setMessages(prev => {
      const exists = draft.id && prev.drafts.some(d => d.id === draft.id)
      const saved = { ...draft, id: draft.id || nextId(), updatedAt: new Date().toISOString() }
      return {
        ...prev,
        drafts: exists ? prev.drafts.map(d => (d.id === saved.id ? saved : d)) : [...prev.drafts, saved],
      }
    })
    setDraft(prev => ({ ...prev, id: prev.id || nextId() }))
  }

  function sendMessage() {
    if (!draft.body.trim() || draft.recipientIds.length === 0) return
    const sent = {
      id: nextId(),
      type: draft.type,
      subject: draft.subject,
      body: draft.body,
      recipientIds: draft.recipientIds,
      sentAt: new Date().toISOString(),
    }
    setMessages(prev => ({
      ...prev,
      sent: [...prev.sent, sent],
      drafts: draft.id ? prev.drafts.filter(d => d.id !== draft.id) : prev.drafts,
    }))
    setDraft(emptyDraft(draft.type))
    setSubTab('sent')
  }

  function deleteDraft(id) {
    setMessages(prev => ({ ...prev, drafts: prev.drafts.filter(d => d.id !== id) }))
  }

  function loadDraft(d) {
    setDraft({ ...d })
    setSubTab('compose')
  }

  function duplicateAndResend(m) {
    setDraft({ id: null, type: m.type, subject: m.subject || '', body: m.body, recipientIds: [...m.recipientIds] })
    setSubTab('compose')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E8DCC8' }}>
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', borderBottom: `2px solid ${subTab === t.key ? '#B89A6A' : 'transparent'}`,
              background: 'none', color: subTab === t.key ? '#2C2416' : '#A89880',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>EMAIL COLUMN</label>
          <select style={inputStyle} value={messages.emailColumnKey} onChange={e => setColumnMapping('emailColumnKey', e.target.value)}>
            <option value="">— choose a field —</option>
            {textColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>PHONE COLUMN</label>
          <select style={inputStyle} value={messages.phoneColumnKey} onChange={e => setColumnMapping('phoneColumnKey', e.target.value)}>
            <option value="">— choose a field —</option>
            {textColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {subTab === 'compose' && (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 2 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setDraft(prev => ({ ...prev, type: 'email' }))}
                style={draft.type === 'email' ? primaryBtn : secondaryBtn}
              >Email</button>
              <button
                onClick={() => setDraft(prev => ({ ...prev, type: 'text' }))}
                style={draft.type === 'text' ? primaryBtn : secondaryBtn}
              >Text</button>
            </div>

            {draft.type === 'email' && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>SUBJECT</label>
                <input
                  style={inputStyle}
                  value={draft.subject}
                  onChange={e => setDraft(prev => ({ ...prev, subject: e.target.value }))}
                  onFocus={() => setInsertAt({ field: 'subject' })}
                  placeholder="Subject"
                />
              </div>
            )}

            <label style={labelStyle}>MESSAGE</label>
            <textarea
              style={{ ...inputStyle, minHeight: 160, resize: 'vertical', fontFamily: 'Jost, sans-serif' }}
              value={draft.body}
              onChange={e => setDraft(prev => ({ ...prev, body: e.target.value }))}
              onFocus={() => setInsertAt({ field: 'body' })}
              placeholder="Write your message…"
            />

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, marginBottom: 16 }}>
              {MERGE_FIELDS.map(f => (
                <button key={f} style={chipBtn} onClick={() => insertField(f)}>{`{{${f}}}`}</button>
              ))}
            </div>

            <label style={labelStyle}>AI DRAFT ASSISTANT — suggested templates</label>
            <div style={{ fontSize: 11, color: '#A89880', marginBottom: 8 }}>
              Picks a smart starting draft using your wedding details. (No external AI service is called — this app has no backend to safely connect one.)
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {MESSAGE_TEMPLATES.filter(t => t.type === draft.type).map(t => (
                <button key={t.label} style={chipBtn} onClick={() => applyTemplate(t)}>{t.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={secondaryBtn} onClick={saveDraft}>Save Draft</button>
              <button style={primaryBtn} onClick={sendMessage}>Send</button>
            </div>
            <div style={{ fontSize: 11, color: '#A89880', marginTop: 8 }}>
              "Send" records this message to each recipient's guest record. No email/SMS provider is connected, so messages are not actually transmitted yet.
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              RECIPIENTS {activeColumn ? `(${draft.recipientIds.length} of ${eligibleRows.length})` : ''}
            </label>
            {!activeColumn ? (
              <div style={{ fontSize: 12, color: '#A89880' }}>
                Choose a {draft.type === 'email' ? 'email' : 'phone'} column above to pick recipients.
              </div>
            ) : (
              <div style={{ border: '1px solid #E8DCC8', borderRadius: 8, maxHeight: 360, overflowY: 'auto' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #E8DCC8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={allEligibleSelected} onChange={toggleSelectAllEligible} />
                  <span style={{ fontSize: 12, color: '#5A4F3A' }}>Select all</span>
                </div>
                {eligibleRows.map(r => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #F3ECDD', fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={draft.recipientIds.includes(r.id)} onChange={() => toggleRecipient(r.id)} />
                    <span>{[r.firstName, r.lastName].filter(Boolean).join(' ') || 'Guest'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#A89880' }}>{r[activeColumn.key]}</span>
                  </label>
                ))}
                {eligibleRows.length === 0 && (
                  <div style={{ padding: 12, fontSize: 12, color: '#A89880' }}>No guests have a value in that field yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'drafts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.drafts.length === 0 && <div style={{ fontSize: 13, color: '#A89880' }}>No saved drafts.</div>}
          {messages.drafts.map(d => (
            <div key={d.id} style={{ border: '1px solid #E8DCC8', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#B89A6A', fontWeight: 500 }}>{d.type === 'email' ? 'EMAIL' : 'TEXT'}</div>
                {d.subject && <div style={{ fontSize: 13, fontWeight: 500 }}>{d.subject}</div>}
                <div style={{ fontSize: 12, color: '#A89880', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 480 }}>{d.body}</div>
              </div>
              <button style={secondaryBtn} onClick={() => loadDraft(d)}>Edit</button>
              <button style={{ ...secondaryBtn, color: '#B05C5C' }} onClick={() => deleteDraft(d.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.sent.length === 0 && <div style={{ fontSize: 13, color: '#A89880' }}>Nothing sent yet.</div>}
          {[...messages.sent].reverse().map(m => (
            <div key={m.id} style={{ border: '1px solid #E8DCC8', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#B89A6A', fontWeight: 500 }}>
                  {m.type === 'email' ? 'EMAIL' : 'TEXT'} · {m.recipientIds.length} recipient{m.recipientIds.length === 1 ? '' : 's'} · {new Date(m.sentAt).toLocaleDateString()}
                </div>
                {m.subject && <div style={{ fontSize: 13, fontWeight: 500 }}>{m.subject}</div>}
                <div style={{ fontSize: 12, color: '#A89880', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 480 }}>{m.body}</div>
              </div>
              <button style={secondaryBtn} onClick={() => duplicateAndResend(m)}>Duplicate & Resend</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
