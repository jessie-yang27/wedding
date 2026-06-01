import { useState } from 'react'
import { daysUntil, formatDate, WEDDING_DATE } from './data'
import { StatusBadge, ReadinessGauge } from './components'
import AIPlanner from './AIPlanner'

export default function Dashboard({ vendors, budget, tasks, onReset }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const days = daysUntil(WEDDING_DATE)

  const totalBudget = budget.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0)
  const totalSpent = budget.reduce((s, r) => s + (parseFloat(r.spent) || 0), 0)
  const remaining = totalBudget - totalSpent
  const risks = vendors.filter(v => ['Payment Due', 'Not Started', 'Incomplete', 'Pending Approval'].includes(v.status))
  const readiness = Math.round(100 - (risks.length / vendors.length) * 60 - (days < 20 ? 5 : 0))
  const upcomingTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)

  const TABS = ['dashboard', 'vendors', 'budget', 'ai-planner']

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0' }}>
      {/* Header */}
      <div className="header-bar">
        <div className="header-inner">
          <div className="header-brand">
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, color: '#2C2416' }}>Jessie & Patrick</h1>
            <span style={{ fontSize: 12, color: '#B89A6A', letterSpacing: '0.12em' }}>JUNE 20, 2026</span>
          </div>
          <div className="header-right">
            <div style={{ textAlign: 'right' }}>
              <div className="serif" style={{ fontSize: 28, fontWeight: 300, color: '#2C2416', lineHeight: 1 }}>{days}</div>
              <div style={{ fontSize: 11, color: '#A89880', letterSpacing: '0.1em' }}>DAYS TO GO</div>
            </div>
            <button onClick={onReset} style={{ fontSize: 12, color: '#A89880', background: 'none', border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ← New Upload
            </button>
          </div>
        </div>
        <div className="nav-tabs-inner">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="nav-tab" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab ? '#2C2416' : '#A89880',
              borderBottom: activeTab === tab ? '2px solid #B89A6A' : '2px solid transparent',
              transition: 'color 0.15s',
            }}>
              {tab === 'ai-planner' ? 'AI Planner' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page-container">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="dashboard-top-grid">
              {/* Readiness */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>READINESS</div>
                <ReadinessGauge score={readiness} />
              </div>

              {/* Budget */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>BUDGET</div>
                <div className="serif" style={{ fontSize: 36, fontWeight: 300, color: '#2C2416', marginBottom: 4 }}>
                  ${totalSpent.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 20 }}>of ${totalBudget.toLocaleString()} total</div>
                <div style={{ background: '#F0EDE8', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#B89A6A', height: '100%', width: `${Math.min(100, Math.round(totalSpent / totalBudget * 100))}%`, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: '#7A6E5C' }}>{Math.round(totalSpent / totalBudget * 100)}% used</span>
                  <span style={{ fontSize: 12, color: '#4A8C6E', fontWeight: 500 }}>${remaining.toLocaleString()} remaining</span>
                </div>
              </div>

              {/* Open Risks */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#C4614A', marginBottom: 16, fontWeight: 500 }}>OPEN RISKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {risks.slice(0, 5).map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.status === 'Not Started' ? '#C4614A' : '#B8923A', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#2C2416' }}>{r.vendor}</span>
                      <span style={{ fontSize: 11, color: '#A89880', marginLeft: 'auto' }}>{r.status}</span>
                    </div>
                  ))}
                  {risks.length === 0 && <p style={{ fontSize: 13, color: '#7A8C6E' }}>All clear — no open risks.</p>}
                </div>
              </div>
            </div>

            <div className="dashboard-bottom-grid">
              {/* Tasks */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>UPCOMING TASKS</div>
                <div>
                  {upcomingTasks.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < upcomingTasks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                      <div style={{ width: 48, fontSize: 11, color: '#A89880', fontWeight: 500 }}>{formatDate(t.date)}</div>
                      <div style={{ flex: 1, fontSize: 13, color: '#2C2416' }}>{t.task}</div>
                      <span style={{ fontSize: 11, color: t.priority === 'High' ? '#C4614A' : '#B8923A', fontWeight: 500 }}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendors snapshot */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>VENDORS</div>
                <div>
                  {vendors.slice(0, 6).map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: i < Math.min(vendors.length, 6) - 1 ? '1px solid #F0EDE8' : 'none' }}>
                      <div style={{ flex: 1, fontSize: 13, color: '#2C2416' }}>{v.vendor}</div>
                      <StatusBadge status={v.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EDE8' }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Vendor Tracker</div>
            </div>
            <div className="vendor-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDFCF9' }}>
                  {['Vendor', 'Category', 'Status', 'Cost', 'Due Date'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.1em', borderBottom: '1px solid #F0EDE8' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F9F6F0', background: 'white' }}
                    onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: '#2C2416' }}>{v.vendor}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#7A6E5C' }}>{v.category}</td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={v.status} /></td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#2C2416', fontWeight: 500 }}>${Number(v.cost || 0).toLocaleString()}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#7A6E5C' }}>{formatDate(v.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div>
            <div className="budget-summary-grid">
              {[
                { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}` },
                { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, sub: `${Math.round(totalSpent / totalBudget * 100)}% of budget` },
                { label: 'Remaining', value: `$${remaining.toLocaleString()}`, sub: remaining < 5000 ? 'Low — watch carefully' : 'Comfortable buffer', warn: remaining < 5000 },
              ].map((c, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 10, fontWeight: 500 }}>{c.label.toUpperCase()}</div>
                  <div className="serif" style={{ fontSize: 34, fontWeight: 300, color: '#2C2416' }}>{c.value}</div>
                  {c.sub && <div style={{ fontSize: 12, color: c.warn ? '#C4614A' : '#7A6E5C', marginTop: 4 }}>{c.sub}</div>}
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EDE8' }}>
                <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Budget by Category</div>
              </div>
              {budget.map((b, i) => {
                const pct = Math.min(100, Math.round((b.spent / b.budget) * 100)) || 0
                return (
                  <div key={i} style={{ padding: '14px 28px', borderBottom: '1px solid #F9F6F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: '#2C2416', fontWeight: 500 }}>{b.category}</span>
                      <span style={{ fontSize: 13, color: '#7A6E5C' }}>${Number(b.spent).toLocaleString()} / ${Number(b.budget).toLocaleString()}</span>
                    </div>
                    <div style={{ background: '#F0EDE8', borderRadius: 3, height: 5 }}>
                      <div style={{ background: pct > 90 ? '#C4614A' : '#B89A6A', height: '100%', width: `${pct}%`, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI PLANNER */}
        {activeTab === 'ai-planner' && (
          <AIPlanner vendors={vendors} budget={budget} tasks={tasks} readiness={readiness} />
        )}

      </div>
    </div>
  )
}
