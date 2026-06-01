import { useState } from 'react'
import UploadScreen from './UploadScreen'
import Dashboard from './Dashboard'
import { SAMPLE_VENDORS, SAMPLE_BUDGET, SAMPLE_TASKS, parseCsv } from './data'

export default function App() {
  const [screen, setScreen] = useState('upload')
  const [vendors, setVendors] = useState(SAMPLE_VENDORS)
  const [budget, setBudget] = useState(SAMPLE_BUDGET)
  const [tasks, setTasks] = useState(SAMPLE_TASKS)
  const [usedSample, setUsedSample] = useState(false)

  const handleGenerate = (files, notes) => {
    let parsedVendors = SAMPLE_VENDORS
    let parsedBudget = SAMPLE_BUDGET
    let parsedTasks = SAMPLE_TASKS
    let usingSample = true

    if (files.vendors) {
      try {
        const rows = parseCsv(files.vendors)
        if (rows.length) {
          parsedVendors = rows.map(r => ({
            vendor: r.vendor, category: r.category, status: r.status,
            cost: parseFloat(r.cost) || 0, dueDate: r.duedate || r.due_date || '',
          }))
          usingSample = false
        }
      } catch {}
    }
    if (files.budget) {
      try {
        const rows = parseCsv(files.budget)
        if (rows.length) {
          parsedBudget = rows.map(r => ({ category: r.category, budget: parseFloat(r.budget) || 0, spent: parseFloat(r.spent) || 0 }))
          usingSample = false
        }
      } catch {}
    }
    if (files.timeline) {
      try {
        const rows = parseCsv(files.timeline)
        if (rows.length) {
          parsedTasks = rows.map(r => ({ date: r.date, task: r.task, priority: r.priority || 'Medium' }))
          usingSample = false
        }
      } catch {}
    }

    setVendors(parsedVendors)
    setBudget(parsedBudget)
    setTasks(parsedTasks)
    setUsedSample(!files.vendors && !files.budget && !files.timeline)
    setScreen('dashboard')
  }

  return (
    <>
      {usedSample && screen === 'dashboard' && (
        <div style={{ background: '#FEF3E2', padding: '10px 32px', fontSize: 13, color: '#8C5A0A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>ⓘ</span> Using sample data — upload your own CSVs to personalize your dashboard.
        </div>
      )}
      {screen === 'upload'
        ? <UploadScreen onGenerate={handleGenerate} />
        : <Dashboard vendors={vendors} budget={budget} tasks={tasks} onReset={() => { setScreen('upload'); setUsedSample(false) }} />
      }
    </>
  )
}
