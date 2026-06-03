import { useState } from 'react'

const STEPS = ['welcome', 'connect', 'details', 'done']

const BUDGET_RANGES = [
  'Under $20,000',
  '$20,000 – $40,000',
  '$40,000 – $75,000',
  '$75,000 – $150,000',
  '$150,000+',
]

export default function OnboardScreen({ clientName, onComplete }) {
  const [step, setStep] = useState('welcome')
  const [googleConnected, setGoogleConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [details, setDetails] = useState({
    partnerName: '',
    weddingDate: '',
    venue: '',
    guestCount: '',
    budgetRange: '',
    extraNotes: '',
  })

  const firstName = clientName?.split(' ')[0] || 'there'

  const handleConnectGoogle = () => {
    setConnecting(true)
    // Redirect to Google OAuth — the callback will return here with ?google=connected
    window.location.href = `/api/google-auth?return=${encodeURIComponent(window.location.href)}`
  }

  const handleSkipGoogle = () => {
    setStep('details')
  }

  const handleDetailsSubmit = () => {
    if (!details.weddingDate) return
    setStep('done')
    setTimeout(() => {
      onComplete({ googleConnected, details })
    }, 1800)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid #E0D4C0', borderRadius: 8,
    fontSize: 14, color: '#2C2416', background: '#FDFCF9', outline: 'none',
    fontFamily: 'Jost, sans-serif', boxSizing: 'border-box',
  }
  const labelStyle = {
    fontSize: 11, letterSpacing: '0.12em', color: '#B89A6A', fontWeight: 500,
    marginBottom: 6, display: 'block',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      background: '#FDFCF9',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>
            JESSIE'S WEDDING PLANNING
          </div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 300, color: '#2C2416', margin: 0, lineHeight: 1.2 }}>
            Your AI Wedding<br /><em>Chief of Staff</em>
          </h1>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {['connect', 'details'].map((s, i) => {
              const active = (s === 'connect' && (step === 'welcome' || step === 'connect')) || s === step
              const done = (s === 'connect' && step === 'details')
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 600,
                    background: done ? '#7A8C6E' : active ? '#2C2416' : '#E8DCC8',
                    color: done || active ? 'white' : '#A89880',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: active ? '#2C2416' : '#A89880' }}>
                    {s === 'connect' ? 'Connect accounts' : 'Your wedding'}
                  </span>
                  {i === 0 && <div style={{ width: 24, height: 1, background: '#E0D4C0' }} />}
                </div>
              )
            })}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #E8DCC8',
          padding: '36px 32px', boxShadow: '0 2px 20px rgba(184,154,106,0.08)',
        }}>

          {/* STEP: welcome */}
          {step === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💍</div>
              <h2 className="serif" style={{ fontSize: 26, fontWeight: 300, color: '#2C2416', margin: '0 0 12px' }}>
                Welcome, {firstName}!
              </h2>
              <p style={{ fontSize: 14, color: '#7A6E5C', lineHeight: 1.7, marginBottom: 28 }}>
                I'm your personal wedding AI — here to keep everything organized, flag what needs attention, and answer any question you have along the way.
              </p>
              <p style={{ fontSize: 13, color: '#A89880', lineHeight: 1.6, marginBottom: 32 }}>
                Setup takes about 2 minutes. We'll connect your Google account to pull in vendor emails and any planning spreadsheets you have, then you'll answer a few quick questions.
              </p>
              <button onClick={() => setStep('connect')} style={primaryBtn}>
                Let's get started →
              </button>
            </div>
          )}

          {/* STEP: connect Google */}
          {step === 'connect' && (
            <div>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 300, color: '#2C2416', margin: '0 0 8px' }}>
                Connect your Google account
              </h2>
              <p style={{ fontSize: 13, color: '#7A6E5C', lineHeight: 1.7, marginBottom: 24 }}>
                This lets your Chief of Staff automatically pull in vendor emails and any planning spreadsheets — so you don't have to copy-paste anything.
              </p>

              <div style={{ background: '#F9F6F0', borderRadius: 10, padding: '16px 18px', marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2C2416', marginBottom: 10 }}>What we'll access:</div>
                {[
                  ['📧', 'Gmail', 'Vendor quotes, confirmations & follow-ups'],
                  ['📊', 'Google Sheets', 'Your vendor list, budget & timeline (if you have one)'],
                ].map(([icon, name, desc]) => (
                  <div key={name} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2C2416' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#A89880' }}>{desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#A89880', marginTop: 10, borderTop: '1px solid #E8DCC8', paddingTop: 10 }}>
                  🔒 Read-only access. We never send emails or edit files on your behalf.
                </div>
              </div>

              <button onClick={handleConnectGoogle} disabled={connecting} style={{
                ...primaryBtn,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
                opacity: connecting ? 0.7 : 1,
              }}>
                <GoogleIcon />
                {connecting ? 'Redirecting to Google…' : 'Connect Google account'}
              </button>

              <button onClick={handleSkipGoogle} style={ghostBtn}>
                Skip for now — I'll connect later
              </button>
            </div>
          )}

          {/* STEP: wedding details */}
          {step === 'details' && (
            <div>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 300, color: '#2C2416', margin: '0 0 8px' }}>
                Tell me about your wedding
              </h2>
              <p style={{ fontSize: 13, color: '#7A6E5C', lineHeight: 1.7, marginBottom: 24 }}>
                Just a few quick questions so I can personalize your dashboard.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>YOUR PARTNER'S NAME</label>
                  <input style={inputStyle} placeholder="e.g. Alex" value={details.partnerName}
                    onChange={e => setDetails(d => ({ ...d, partnerName: e.target.value }))} />
                </div>

                <div>
                  <label style={labelStyle}>WEDDING DATE *</label>
                  <input style={inputStyle} type="date" value={details.weddingDate}
                    onChange={e => setDetails(d => ({ ...d, weddingDate: e.target.value }))} />
                </div>

                <div>
                  <label style={labelStyle}>VENUE (IF BOOKED)</label>
                  <input style={inputStyle} placeholder="e.g. The Ritz-Carlton, Half Moon Bay"
                    value={details.venue}
                    onChange={e => setDetails(d => ({ ...d, venue: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>GUEST COUNT</label>
                    <input style={inputStyle} placeholder="e.g. 120" value={details.guestCount}
                      onChange={e => setDetails(d => ({ ...d, guestCount: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>BUDGET RANGE</label>
                    <select style={inputStyle} value={details.budgetRange}
                      onChange={e => setDetails(d => ({ ...d, budgetRange: e.target.value }))}>
                      <option value="">Select…</option>
                      {BUDGET_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>ANYTHING ELSE I SHOULD KNOW?</label>
                  <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                    placeholder="Vibe, priorities, things you're stressed about…"
                    value={details.extraNotes}
                    onChange={e => setDetails(d => ({ ...d, extraNotes: e.target.value }))} />
                </div>
              </div>

              <button
                onClick={handleDetailsSubmit}
                disabled={!details.weddingDate}
                style={{ ...primaryBtn, marginTop: 24, opacity: details.weddingDate ? 1 : 0.5 }}
              >
                Build my dashboard →
              </button>
            </div>
          )}

          {/* STEP: done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 300, color: '#2C2416', marginBottom: 12 }}>
                Setting up your dashboard…
              </h2>
              <p style={{ fontSize: 14, color: '#7A6E5C', lineHeight: 1.7 }}>
                Pulling in your data and getting everything organized.
              </p>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                <LoadingDots />
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0B4A0', marginTop: 20 }}>
          Powered by Jessie's Wedding Planning · Your data stays private
        </p>
      </div>
    </div>
  )
}

const primaryBtn = {
  width: '100%', padding: '14px', background: '#2C2416', color: '#F9F6F0',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
  letterSpacing: '0.06em', cursor: 'pointer', display: 'block',
}

const ghostBtn = {
  width: '100%', padding: '12px', background: 'transparent', color: '#A89880',
  border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer',
  marginTop: 10, textDecoration: 'underline',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: '#B89A6A',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
    </div>
  )
}
