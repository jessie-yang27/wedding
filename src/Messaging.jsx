import { useState } from 'react'

export default function Messaging({ guests }) {
  const [channel, setChannel] = useState('email')
  const [audience, setAudience] = useState('all')
  const [selected, setSelected] = useState(new Set())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sentLog, setSentLog] = useState([])

  const audienceGuests = guests.filter(g => {
    if (audience === 'all') return true
    if (audience === 'pending') return g.rsvp === 'Pending'
    if (audience === 'yes') return g.rsvp === 'Yes'
    if (audience === 'no') return g.rsvp === 'No'
    if (audience === 'rehearsal') return g.rehearsalDinner
    return true
  }).filter(g => channel === 'email' ? !!g.email : !!g.phone)

  const recipients = audienceGuests

  const send = () => {
    if (!body.trim() || recipients.length === 0) return
    setSentLog(log => [
      { channel, count: recipients.length, subject: channel === 'email' ? subject : null, body, at: new Date().toLocaleString() },
      ...log,
    ])
    setSubject('')
    setBody('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>CHANNEL</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['email', 'text'].map(c => (
            <button key={c} onClick={() => setChannel(c)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${channel === c ? '#2C2416' : '#E8DCC8'}`,
              background: channel === c ? '#2C2416' : 'white',
              color: channel === c ? '#F9F6F0' : '#7A6E5C',
            }}>
              {c === 'email' ? '✉️ Email' : '💬 Text'}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>AUDIENCE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[
            ['all', 'All guests'],
            ['yes', 'Attending'],
            ['pending', 'Pending RSVP'],
            ['no', 'Declined'],
            ['rehearsal', 'Rehearsal dinner'],
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2C2416', cursor: 'pointer' }}>
              <input type="radio" name="audience" checked={audience === key} onChange={() => setAudience(key)} />
              {label}
            </label>
          ))}
        </div>

        <div style={{ background: '#F9F6F0', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 24, fontWeight: 300, color: '#2C2416' }} className="serif">{recipients.length}</div>
          <div style={{ fontSize: 11, color: '#A89880' }}>recipients with a valid {channel === 'email' ? 'email' : 'phone number'}</div>
        </div>
      </div>

      <div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: 24, marginBottom: 20 }}>
          <div className="serif" style={{ fontSize: 20, marginBottom: 16 }}>Compose</div>
          {channel === 'email' && (
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              style={{ ...fieldStyle, marginBottom: 10 }}
            />
          )}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={channel === 'email' ? 'Write your email to guests…' : 'Write your text message…'}
            style={{ ...fieldStyle, minHeight: 140, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: '#A89880' }}>
              Will send to {recipients.length} {channel === 'email' ? 'email' : 'phone'} recipient{recipients.length === 1 ? '' : 's'}
            </span>
            <button onClick={send} disabled={!body.trim() || recipients.length === 0} style={{
              ...primaryBtn, opacity: body.trim() && recipients.length > 0 ? 1 : 0.45,
              cursor: body.trim() && recipients.length > 0 ? 'pointer' : 'not-allowed',
            }}>
              Send to {recipients.length}
            </button>
          </div>
        </div>

        {sentLog.length > 0 && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>SENT HISTORY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sentLog.map((s, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#F9F6F0', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#4A8C6E', fontWeight: 500 }}>
                    {s.channel === 'email' ? '✉️' : '💬'} Sent to {s.count} guests · {s.at}
                  </div>
                  {s.subject && <div style={{ fontSize: 13, color: '#2C2416', marginTop: 4, fontWeight: 500 }}>{s.subject}</div>}
                  <div style={{ fontSize: 12, color: '#7A6E5C', marginTop: 2, whiteSpace: 'pre-wrap' }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%', border: '1px solid #E0D4C0', borderRadius: 8, padding: '10px 12px',
  fontSize: 13, fontFamily: 'Jost, sans-serif', background: '#FDFCF9', outline: 'none', boxSizing: 'border-box',
}
const primaryBtn = {
  background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8,
  padding: '10px 18px', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
}
