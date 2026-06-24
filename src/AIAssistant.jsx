import { useState, useRef, useEffect } from 'react'
import { guestsToCsvText } from './data'

const QUICK_ACTIONS = [
  { label: 'Who still needs to RSVP?', icon: '🔍' },
  { label: 'List guests with dietary restrictions', icon: '🍽️' },
  { label: 'Export guest list as CSV for TheKnot', icon: '📤' },
  { label: 'Draft a reminder email for pending RSVPs', icon: '✉️' },
]

export default function AIAssistant({ guests }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const buildContext = () => {
    const csv = guestsToCsvText(guests)
    return `You are an AI assistant helping Jessie, a busy bride, manage her wedding guest list. She is consolidating information that used to be scattered across Google Sheets, TheKnot, WeddingWire, Minted, AislePlanner, and a Reminders app — your job is to be the single source of truth and help her query and reformat this guest data for whatever she needs next (exporting to a wedding website, seating chart tool, caterer headcount, etc).

Current guest list (CSV):
${csv}

When asked to "export" or "format" data for a specific platform (TheKnot, WeddingWire, Minted, AislePlanner, a caterer, etc.), produce a clean CSV or table in a code block using only the relevant columns for that purpose, and briefly explain what you included. When asked a question about the guest list, answer directly using the data above — don't make up guests that aren't listed. Be warm, concise, and decisive. Use bullet points when listing multiple guests.`
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return
    const userMsg = { role: 'user', content: text }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: buildContext(),
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        const errMsg = data.error?.message || JSON.stringify(data)
        setMessages(prev => [...prev, { role: 'assistant', content: `Error ${response.status}: ${errMsg}` }])
        return
      }
      const reply = data.content?.[0]?.text || "I couldn't generate a response right now."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Something went wrong: ${err.message}` }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
      <div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>QUICK ACTIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
                  background: '#FDFCF9', border: '1px solid #E8DCC8', borderRadius: 8,
                  cursor: 'pointer', fontSize: 12, color: '#2C2416', textAlign: 'left',
                  fontFamily: 'Jost, sans-serif', lineHeight: 1.4,
                }}
              >
                <span style={{ fontSize: 16 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: '#F0EDE8', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: 12, color: '#7A6E5C', lineHeight: 1.6 }}>
            Knows your full guest list — RSVPs, meals, tables, hotel, and dietary notes. Ask it to query or reformat data for any platform you need.
          </p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', display: 'flex', flexDirection: 'column', height: 560 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8' }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: '#2C2416' }}>Guest List Assistant</div>
          <div style={{ fontSize: 12, color: '#A89880' }}>Powered by Claude · Knows your guest list</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="serif" style={{ fontSize: 18, color: '#B89A6A', marginBottom: 8, fontStyle: 'italic' }}>How can I help you today?</div>
              <p style={{ fontSize: 13, color: '#A89880', lineHeight: 1.6 }}>
                Ask me to find guests, summarize RSVPs, or format your list for another wedding site.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%', padding: '12px 16px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user' ? '#2C2416' : '#F9F6F0',
                color: m.role === 'user' ? '#F9F6F0' : '#2C2416',
                fontSize: 13, lineHeight: 1.7,
                border: m.role === 'assistant' ? '1px solid #E8DCC8' : 'none',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: 5, padding: '8px 4px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#B89A6A', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask about your guest list…"
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid #E0D4C0', borderRadius: 8,
              fontSize: 13, color: '#2C2416', background: '#FDFCF9', outline: 'none',
              fontFamily: 'Jost, sans-serif',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={{
              padding: '10px 18px',
              background: input.trim() && !isTyping ? '#2C2416' : '#E0D4C0',
              color: input.trim() && !isTyping ? '#F9F6F0' : '#A89880',
              border: 'none', borderRadius: 8,
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 500, fontFamily: 'Jost, sans-serif',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
