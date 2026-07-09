const FIELDS = [
  { key: 'coupleName', label: 'Couple Name', placeholder: 'e.g. Alex Chen & Jordan Lee' },
  { key: 'weddingDate', label: 'Wedding Date', placeholder: 'e.g. June 20, 2026', type: 'date' },
  { key: 'venue', label: 'Venue', placeholder: 'e.g. Grand Island Mansion' },
]

export default function WeddingInfo({ info, setInfo }) {
  const update = (key, val) => setInfo(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: 32 }}>
        <div className="serif" style={{ fontSize: 24, marginBottom: 6 }}>Tell us about your wedding</div>
        <p style={{ fontSize: 13, color: '#A89880', marginBottom: 28 }}>
          Fill in whatever you know — you can always come back and change it later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', color: '#B89A6A', fontWeight: 500, marginBottom: 8 }}>
                {f.label.toUpperCase()}
              </label>
              <input
                type={f.type === 'date' ? 'date' : 'text'}
                value={info[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', border: '1px solid #E0D4C0', borderRadius: 8, padding: '11px 14px',
                  fontSize: 14, fontFamily: 'Jost, sans-serif', background: '#FDFCF9', outline: 'none',
                  boxSizing: 'border-box', color: '#2C2416',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
