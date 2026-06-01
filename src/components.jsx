export function StatusBadge({ status }) {
  const map = {
    'Complete':         { bg: '#EAF4EE', color: '#2E6E4A' },
    'Confirmed':        { bg: '#EAF4EE', color: '#2E6E4A' },
    'Payment Due':      { bg: '#FEF3E2', color: '#8C5A0A' },
    'Pending Approval': { bg: '#FEF3E2', color: '#8C5A0A' },
    'Not Started':      { bg: '#FCECEA', color: '#8C2A1E' },
    'Incomplete':       { bg: '#FCECEA', color: '#8C2A1E' },
  }
  const s = map[status] || { bg: '#F0EDE8', color: '#7A6E5C' }
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 500,
      padding: '3px 10px', borderRadius: 20, letterSpacing: '0.03em', whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  )
}

export function ReadinessGauge({ score }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E8DCC8" strokeWidth="8" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#B89A6A" strokeWidth="8"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="70" y="65" textAnchor="middle" fontFamily="Cormorant Garamond, serif"
        fontSize="32" fontWeight="400" fill="#2C2416">{score}%</text>
      <text x="70" y="83" textAnchor="middle" fontFamily="Jost, sans-serif"
        fontSize="11" fill="#7A6E5C" letterSpacing="0.08em">READY</text>
    </svg>
  )
}
