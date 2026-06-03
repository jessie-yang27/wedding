import { useState } from 'react'
import { daysUntil, formatDate, WEDDING_DATE } from './data'
import { StatusBadge, ReadinessGauge } from './components'
import AIPlanner from './AIPlanner'

const STATUSES = ['Confirmed', 'Complete', 'Payment Due', 'Pending Approval', 'Incomplete', 'Not Started']
const CATEGORIES_VENDOR = ['Venue', 'Photography', 'Flowers', 'Entertainment', 'Catering', 'Beauty', 'Logistics', 'Events', 'Ceremony', 'Miscellaneous']

const EMPTY_VENDOR = { vendor: '', category: 'Venue', status: 'Not Started', cost: '', dueDate: '' }
const EMPTY_BUDGET = { category: '', budget: '', spent: '' }

function InlineEdit({ value, onChange, type = 'text', options, style = {} }) {
  const [editing, setEditing] = useState(false)

  if (options) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: '1px solid #E0D4C0', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', color: '#2C2416', cursor: 'pointer', ...style }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => e.key === 'Enter' && setEditing(false)}
        style={{ border: '1px solid #B89A6A', borderRadius: 6, padding: '4px 8px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', color: '#2C2416', outline: 'none', width: '100%', boxSizing: 'border-box', ...style }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ cursor: 'text', borderRadius: 4, padding: '2px 4px', display: 'inline-block', minWidth: 40, ...style }}
      onMouseOver={e => e.currentTarget.style.background = '#F5F0E8'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      {value || <span style={{ color: '#C0B4A0', fontStyle: 'italic' }}>—</span>}
    </span>
  )
}

export default function Dashboard({ vendors: initialVendors, budget: initialBudget, tasks, clientName, clientDetails, googleConnected, onReset }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [vendors, setVendors] = useState(initialVendors)
  const [budget, setBudget] = useState(initialBudget)
  const [addingVendor, setAddingVendor] = useState(false)
  const [newVendor, setNewVendor] = useState(EMPTY_VENDOR)
  const [addingBudget, setAddingBudget] = useState(false)
  const [newBudget, setNewBudget] = useState(EMPTY_BUDGET)
  const [taskList, setTaskList] = useState(tasks)
  const [addingTask, setAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({ date: '', task: '', priority: 'High' })

  const updateTask = (i, field, val) => setTaskList(ts => ts.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  const deleteTask = (i) => setTaskList(ts => ts.filter((_, idx) => idx !== i))
  const saveNewTask = () => {
    if (!newTask.task.trim()) return
    setTaskList(ts => [...ts, { ...newTask }])
    setNewTask({ date: '', task: '', priority: 'High' })
    setAddingTask(false)
  }

  const days = daysUntil(clientDetails?.weddingDate ? new Date(clientDetails.weddingDate) : WEDDING_DATE)
  const totalBudget = budget.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0)
  const totalSpent = budget.reduce((s, r) => s + (parseFloat(r.spent) || 0), 0)
  const remaining = totalBudget - totalSpent
  const risks = vendors.filter(v => ['Payment Due', 'Not Started', 'Incomplete', 'Pending Approval'].includes(v.status))
  const readiness = Math.round(100 - (risks.length / Math.max(vendors.length, 1)) * 60 - (days < 20 ? 5 : 0))
  const upcomingTasks = [...taskList].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)

  const displayName = clientDetails?.partnerName
    ? `${clientName?.split(' ')[0] || 'Your'} & ${clientDetails.partnerName}`
    : clientName?.split(' ')[0] || 'Jessie & Patrick'

  // --- Vendor CRUD ---
  const updateVendor = (i, field, val) => setVendors(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: val } : v))
  const deleteVendor = (i) => setVendors(vs => vs.filter((_, idx) => idx !== i))
  const saveNewVendor = () => {
    if (!newVendor.vendor.trim()) return
    setVendors(vs => [...vs, { ...newVendor, cost: parseFloat(newVendor.cost) || 0 }])
    setNewVendor(EMPTY_VENDOR)
    setAddingVendor(false)
  }

  // --- Budget CRUD ---
  const updateBudget = (i, field, val) => setBudget(bs => bs.map((b, idx) => idx === i ? { ...b, [field]: val } : b))
  const deleteBudget = (i) => setBudget(bs => bs.filter((_, idx) => idx !== i))
  const saveNewBudget = () => {
    if (!newBudget.category.trim()) return
    setBudget(bs => [...bs, { ...newBudget, budget: parseFloat(newBudget.budget) || 0, spent: parseFloat(newBudget.spent) || 0 }])
    setNewBudget(EMPTY_BUDGET)
    setAddingBudget(false)
  }

  const TABS = ['dashboard', 'vendors', 'budget', 'ai-planner']

  const cellStyle = { padding: '12px 16px', fontSize: 13 }
  const thStyle = { padding: '11px 16px', textAlign: 'left', fontSize: 11, color: '#A89880', fontWeight: 500, letterSpacing: '0.1em', borderBottom: '1px solid #F0EDE8', background: '#FDFCF9' }
  const addRowInputStyle = { border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8DCC8', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, color: '#2C2416' }}>{displayName}</h1>
            <span style={{ fontSize: 12, color: '#B89A6A', letterSpacing: '0.12em' }}>
              {clientDetails?.weddingDate
                ? new Date(clientDetails.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
                : 'JUNE 20, 2026'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="serif" style={{ fontSize: 28, fontWeight: 300, color: '#2C2416', lineHeight: 1 }}>{days}</div>
              <div style={{ fontSize: 11, color: '#A89880', letterSpacing: '0.1em' }}>DAYS TO GO</div>
            </div>
            <button onClick={onReset} style={{ fontSize: 12, color: '#A89880', background: 'none', border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 20px', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em',
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Readiness */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>READINESS</div>
                <ReadinessGauge score={readiness} />
              </div>

              {/* Budget — click spent/budget to edit */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', marginBottom: 16, fontWeight: 500 }}>BUDGET</div>
                <div className="serif" style={{ fontSize: 36, fontWeight: 300, color: '#2C2416', marginBottom: 4 }}>${totalSpent.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 20 }}>of ${totalBudget.toLocaleString()} total</div>
                <div style={{ background: '#F0EDE8', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#B89A6A', height: '100%', width: `${Math.min(100, Math.round(totalSpent / Math.max(totalBudget, 1) * 100))}%`, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: '#7A6E5C' }}>{Math.round(totalSpent / Math.max(totalBudget, 1) * 100)}% used</span>
                  <span style={{ fontSize: 12, color: '#4A8C6E', fontWeight: 500 }}>${remaining.toLocaleString()} remaining</span>
                </div>
                <button onClick={() => setActiveTab('budget')} style={{ marginTop: 14, fontSize: 11, color: '#B89A6A', background: 'none', border: '1px solid #E8DCC8', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                  Edit budget →
                </button>
              </div>

              {/* Open Risks — click status to update inline */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#C4614A', marginBottom: 16, fontWeight: 500 }}>OPEN RISKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {risks.slice(0, 5).map((r, i) => {
                    const vi = vendors.indexOf(r)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.status === 'Not Started' ? '#C4614A' : '#B8923A', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#2C2416', flex: 1 }}>{r.vendor}</span>
                        <select
                          value={r.status}
                          onChange={e => updateVendor(vi, 'status', e.target.value)}
                          style={{ fontSize: 11, border: '1px solid #E0D4C0', borderRadius: 6, padding: '2px 6px', color: '#8C5A0A', background: '#FEF3E2', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
                        >
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    )
                  })}
                  {risks.length === 0 && <p style={{ fontSize: 13, color: '#7A8C6E' }}>All clear — no open risks.</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Tasks — inline edit + add + delete */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', fontWeight: 500 }}>UPCOMING TASKS</div>
                  <button onClick={() => setAddingTask(true)} style={{ fontSize: 11, color: '#B89A6A', background: 'none', border: '1px solid #E8DCC8', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>+ Add</button>
                </div>
                {upcomingTasks.map((t, i) => {
                  const ti = tasks.indexOf(t)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < upcomingTasks.length - 1 ? '1px solid #F0EDE8' : 'none' }}
                      onMouseOver={e => e.currentTarget.querySelector('.del-task').style.opacity = '1'}
                      onMouseOut={e => e.currentTarget.querySelector('.del-task').style.opacity = '0'}>
                      <input type="date" value={t.date} onChange={e => updateTask(ti, 'date', e.target.value)}
                        style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#A89880', fontFamily: 'Jost, sans-serif', width: 90, cursor: 'pointer' }} />
                      <InlineEdit value={t.task} onChange={val => updateTask(ti, 'task', val)} style={{ flex: 1, fontSize: 13 }} />
                      <select value={t.priority} onChange={e => updateTask(ti, 'priority', e.target.value)}
                        style={{ fontSize: 11, border: 'none', background: 'transparent', color: t.priority === 'High' ? '#C4614A' : '#B8923A', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                      <button className="del-task" onClick={() => deleteTask(ti)} style={{ ...deleteBtn, opacity: 0, transition: 'opacity 0.15s' }}>✕</button>
                    </div>
                  )
                })}
                {addingTask && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F0EDE8', flexWrap: 'wrap' }}>
                    <input type="date" value={newTask.date} onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))}
                      style={{ ...addRowInputStyle, width: 130 }} autoFocus />
                    <input placeholder="Task name" value={newTask.task} onChange={e => setNewTask(t => ({ ...t, task: e.target.value }))}
                      style={{ ...addRowInputStyle, flex: 1, minWidth: 120 }} />
                    <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
                      style={{ ...addRowInputStyle, width: 90 }}>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <button onClick={saveNewTask} style={saveBtn}>Save</button>
                    <button onClick={() => setAddingTask(false)} style={cancelBtn}>✕</button>
                  </div>
                )}
              </div>

              {/* Vendors snapshot — status dropdown + name inline edit */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#B89A6A', fontWeight: 500 }}>VENDORS</div>
                  <button onClick={() => setActiveTab('vendors')} style={{ fontSize: 11, color: '#B89A6A', background: 'none', border: '1px solid #E8DCC8', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>See all →</button>
                </div>
                {vendors.slice(0, 6).map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < Math.min(vendors.length, 6) - 1 ? '1px solid #F0EDE8' : 'none' }}>
                    <InlineEdit value={v.vendor} onChange={val => updateVendor(i, 'vendor', val)} style={{ flex: 1, fontSize: 13, color: '#2C2416', fontWeight: 500 }} />
                    <select value={v.status} onChange={e => updateVendor(i, 'status', e.target.value)}
                      style={{ fontSize: 11, border: '1px solid #E0D4C0', borderRadius: 12, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', background: '#F9F6F0' }}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E8DCC8', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Vendor Tracker</div>
              <button onClick={() => { setAddingVendor(true); setNewVendor(EMPTY_VENDOR) }} style={addBtn}>
                + Add Vendor
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Vendor', 'Category', 'Status', 'Cost', 'Due Date', ''].map(h => (
                    <th key={h} style={thStyle}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F9F6F0' }}
                    onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ ...cellStyle, fontWeight: 500, color: '#2C2416' }}>
                      <InlineEdit value={v.vendor} onChange={val => updateVendor(i, 'vendor', val)} />
                    </td>
                    <td style={{ ...cellStyle, color: '#7A6E5C' }}>
                      <InlineEdit value={v.category} onChange={val => updateVendor(i, 'category', val)} options={CATEGORIES_VENDOR} />
                    </td>
                    <td style={cellStyle}>
                      <InlineEdit value={v.status} onChange={val => updateVendor(i, 'status', val)} options={STATUSES} />
                    </td>
                    <td style={{ ...cellStyle, color: '#2C2416', fontWeight: 500 }}>
                      $<InlineEdit value={String(v.cost || 0)} onChange={val => updateVendor(i, 'cost', parseFloat(val) || 0)} type="number" style={{ width: 80 }} />
                    </td>
                    <td style={{ ...cellStyle, color: '#7A6E5C' }}>
                      <InlineEdit value={v.dueDate || ''} onChange={val => updateVendor(i, 'dueDate', val)} type="date" />
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      <button onClick={() => deleteVendor(i)} title="Delete" style={deleteBtn}>✕</button>
                    </td>
                  </tr>
                ))}

                {/* Add new vendor row */}
                {addingVendor && (
                  <tr style={{ background: '#FDFCF9', borderBottom: '1px solid #F0EDE8' }}>
                    <td style={cellStyle}><input style={addRowInputStyle} placeholder="Vendor name" value={newVendor.vendor} onChange={e => setNewVendor(v => ({ ...v, vendor: e.target.value }))} autoFocus /></td>
                    <td style={cellStyle}>
                      <select style={addRowInputStyle} value={newVendor.category} onChange={e => setNewVendor(v => ({ ...v, category: e.target.value }))}>
                        {CATEGORIES_VENDOR.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select style={addRowInputStyle} value={newVendor.status} onChange={e => setNewVendor(v => ({ ...v, status: e.target.value }))}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}><input style={addRowInputStyle} type="number" placeholder="0" value={newVendor.cost} onChange={e => setNewVendor(v => ({ ...v, cost: e.target.value }))} /></td>
                    <td style={cellStyle}><input style={addRowInputStyle} type="date" value={newVendor.dueDate} onChange={e => setNewVendor(v => ({ ...v, dueDate: e.target.value }))} /></td>
                    <td style={{ ...cellStyle, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={saveNewVendor} style={saveBtn}>Save</button>
                      <button onClick={() => setAddingVendor(false)} style={cancelBtn}>✕</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ padding: '12px 24px', background: '#FDFCF9', borderTop: '1px solid #F0EDE8' }}>
              <span style={{ fontSize: 12, color: '#A89880' }}>{vendors.length} vendors · ${vendors.reduce((s, v) => s + (parseFloat(v.cost) || 0), 0).toLocaleString()} total committed</span>
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}` },
                { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, sub: `${Math.round(totalSpent / Math.max(totalBudget, 1) * 100)}% of budget` },
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
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Budget by Category</div>
                <button onClick={() => { setAddingBudget(true); setNewBudget(EMPTY_BUDGET) }} style={addBtn}>
                  + Add Category
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Category', 'Budgeted', 'Spent', 'Remaining', 'Progress', ''].map(h => (
                      <th key={h} style={thStyle}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budget.map((b, i) => {
                    const pct = Math.min(100, Math.round((parseFloat(b.spent) / Math.max(parseFloat(b.budget), 1)) * 100)) || 0
                    const rem = (parseFloat(b.budget) || 0) - (parseFloat(b.spent) || 0)
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #F9F6F0' }}
                        onMouseOver={e => e.currentTarget.style.background = '#FDFCF9'}
                        onMouseOut={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ ...cellStyle, fontWeight: 500, color: '#2C2416' }}>
                          <InlineEdit value={b.category} onChange={val => updateBudget(i, 'category', val)} />
                        </td>
                        <td style={cellStyle}>
                          $<InlineEdit value={String(b.budget || 0)} onChange={val => updateBudget(i, 'budget', val)} type="number" style={{ width: 80 }} />
                        </td>
                        <td style={cellStyle}>
                          $<InlineEdit value={String(b.spent || 0)} onChange={val => updateBudget(i, 'spent', val)} type="number" style={{ width: 80 }} />
                        </td>
                        <td style={{ ...cellStyle, color: rem < 0 ? '#C4614A' : '#4A8C6E', fontWeight: 500 }}>
                          ${rem.toLocaleString()}
                        </td>
                        <td style={{ ...cellStyle, minWidth: 120 }}>
                          <div style={{ background: '#F0EDE8', borderRadius: 3, height: 6 }}>
                            <div style={{ background: pct > 90 ? '#C4614A' : '#B89A6A', height: '100%', width: `${pct}%`, borderRadius: 3, transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize: 11, color: '#A89880', marginTop: 3 }}>{pct}%</div>
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'right' }}>
                          <button onClick={() => deleteBudget(i)} title="Delete" style={deleteBtn}>✕</button>
                        </td>
                      </tr>
                    )
                  })}

                  {/* Add new budget row */}
                  {addingBudget && (
                    <tr style={{ background: '#FDFCF9', borderBottom: '1px solid #F0EDE8' }}>
                      <td style={cellStyle}><input style={addRowInputStyle} placeholder="Category name" value={newBudget.category} onChange={e => setNewBudget(b => ({ ...b, category: e.target.value }))} autoFocus /></td>
                      <td style={cellStyle}><input style={addRowInputStyle} type="number" placeholder="0" value={newBudget.budget} onChange={e => setNewBudget(b => ({ ...b, budget: e.target.value }))} /></td>
                      <td style={cellStyle}><input style={addRowInputStyle} type="number" placeholder="0" value={newBudget.spent} onChange={e => setNewBudget(b => ({ ...b, spent: e.target.value }))} /></td>
                      <td colSpan={2} />
                      <td style={{ ...cellStyle, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={saveNewBudget} style={saveBtn}>Save</button>
                        <button onClick={() => setAddingBudget(false)} style={cancelBtn}>✕</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI PLANNER */}
        {activeTab === 'ai-planner' && (
          <AIPlanner vendors={vendors} budget={budget} tasks={taskList} readiness={readiness} />
        )}

      </div>
    </div>
  )
}

const addBtn = {
  background: '#2C2416', color: '#F9F6F0', border: 'none', borderRadius: 8,
  padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em',
}
const deleteBtn = {
  background: 'none', border: 'none', color: '#D4B8A8', fontSize: 13,
  cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1,
}
const saveBtn = {
  background: '#7A8C6E', color: 'white', border: 'none', borderRadius: 6,
  padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
}
const cancelBtn = {
  background: 'none', border: '1px solid #E0D4C0', color: '#A89880', borderRadius: 6,
  padding: '5px 8px', fontSize: 12, cursor: 'pointer',
}
const addRowInputStyle = {
  border: '1px solid #E0D4C0', borderRadius: 6, padding: '6px 10px',
  fontSize: 13, fontFamily: 'Jost, sans-serif', background: 'white', width: '100%',
  boxSizing: 'border-box', outline: 'none',
}
