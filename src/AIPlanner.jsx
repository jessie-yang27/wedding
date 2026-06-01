import { useState, useRef, useEffect } from 'react'
import { daysUntil, WEDDING_DATE } from './data'

const QUICK_ACTIONS = [
  { label: 'What am I forgetting?', icon: '🔍' },
  { label: 'What should I do this week?', icon: '📋' },
  { label: 'Draft vendor email', icon: '✉️' },
  { label: 'Build weekend itinerary', icon: '📅' },
]

export default function AIPlanner({ vendors, budget, tasks, readiness }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)
  const days = daysUntil(WEDDING_DATE)

  const totalBudget = budget.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0)
  const totalSpent = budget.reduce((s, r) => s + (parseFloat(r.spent) || 0), 0)
  const remaining = totalBudget - totalSpent
  const risks = vendors.filter(v => ['Payment Due', 'Not Started', 'Incomplete', 'Pending Approval'].includes(v.status))

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const buildContext = () => {
    const riskList = risks.map(r => `${r.vendor} (${r.status})`).join(', ')
    const taskList = tasks.map(t => `${t.task} by ${t.date} [${t.priority}]`).join('; ')
    return `You are an AI Wedding Chief of Staff helping a bride named Jessie plan her wedding on June 20, 2026 at Grand Island Mansion with ~95 guests.

Current wedding data:
- Days until wedding: ${days}
- Readiness score: ${readiness}%
- Total budget: $${totalBudget.toLocaleString()}, spent: $${totalSpent.toLocaleString()}, remaining: $${remaining.toLocaleString()}
- Open risks: ${riskList || 'none'}
- Upcoming tasks: ${taskList || 'none'}
- All vendors: ${vendors.map(v => `${v.vendor} (${v.status}, $${v.cost})`).join(', ')}

Be warm, concise, and decisive. Speak like a trusted advisor who knows wedding planning deeply. Use bullet points when listing items. When drafting emails, write them in full. Keep responses focused and actionable.`
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
          max_tokens: 1000,
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
    <div className="ai-planner-layout">
      {/* Sidebar */}
      <div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 14, fontWeight: 500 }}>QUICK ACTIONS</div>
          <div className="ai-quick-actions">
            {QUICK_ACTIONS.map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
                  background: '#FDFCF9', border: '1px solid #E8DCC8', borderRadius: 8,
                  cursor: 'pointer', fontSize: 12, color: '#2C2416', textAlign: 'left',
                  fontFamily: 'Jost, sans-serif', lineHeight: 1.4,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#B89A6A'; e.currentTarget.style.background = '#FBF7F0' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#E8DCC8'; e.currentTarget.style.background = '#FDFCF9' }}
              >
                <span style={{ fontSize: 16 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: '#F0EDE8', borderRadius: 10, padding: '16px 18px' }}>
          <div className="serif" style={{ fontSize: 15, color: '#2C2416', marginBottom: 6, fontStyle: 'italic' }}>
            "{days} days left"
          </div>
          <p style={{ fontSize: 12, color: '#7A6E5C', lineHeight: 1.6 }}>
            Your Chief of Staff knows your full vendor list, budget, and upcoming tasks.
          </p>
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window" style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8' }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: '#2C2416' }}>Wedding Chief of Staff</div>
          <div style={{ fontSize: 12, color: '#A89880' }}>Powered by Claude · Knows your full plan</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="serif" style={{ fontSize: 18, color: '#B89A6A', marginBottom: 8, fontStyle: 'italic' }}>How can I help you today?</div>
              <p style={{ fontSize: 13, color: '#A89880', lineHeight: 1.6 }}>
                Ask me anything about your wedding — I have full context on your vendors, budget, timeline, and risks.
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
            placeholder="Ask your Chief of Staff anything..."
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
