import { useState, useEffect } from 'react'
import OnboardScreen from './OnboardScreen'
import UploadScreen from './UploadScreen'
import Dashboard from './Dashboard'
import { SAMPLE_VENDORS, SAMPLE_BUDGET, SAMPLE_TASKS, parseCsv } from './data'

// Parse ?client=sarah-johnson → "Sarah Johnson"
function clientNameFromParam(param) {
  if (!param) return null
  return param.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Convert Google Sheets rows → vendor/budget/task arrays (best-effort)
function parseSheetRows(rows) {
  if (!rows?.length) return null
  const headers = rows[0].map(h => h?.toLowerCase().trim())
  const data = rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] || '' })
    return obj
  })
  return data
}

function googleRowsToVendors(rows) {
  const data = parseSheetRows(rows)
  if (!data) return null
  if (data[0] && ('vendor' in data[0] || 'name' in data[0])) {
    return data.map(r => ({
      vendor: r.vendor || r.name || '',
      category: r.category || r.type || '',
      status: r.status || 'Not Started',
      cost: parseFloat(r.cost || r.price || 0) || 0,
      dueDate: r.duedate || r.due_date || r.due || '',
    })).filter(v => v.vendor)
  }
  return null
}

function googleRowsToBudget(rows) {
  const data = parseSheetRows(rows)
  if (!data) return null
  if (data[0] && 'budget' in data[0]) {
    return data.map(r => ({
      category: r.category || '',
      budget: parseFloat(r.budget) || 0,
      spent: parseFloat(r.spent || r.actual || 0) || 0,
    })).filter(b => b.category)
  }
  return null
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const clientParam = params.get('client')
  const clientName = clientNameFromParam(clientParam)
  const googleResult = params.get('google') // 'connected' | 'denied' | 'error'

  // Determine initial screen:
  // - ?client= param → show onboarding (unless already onboarded in localStorage)
  // - no param → show legacy upload screen
  const storageKey = clientParam ? `onboarded_${clientParam}` : null
  const alreadyOnboarded = storageKey ? !!localStorage.getItem(storageKey) : false

  const [screen, setScreen] = useState(() => {
    if (alreadyOnboarded) return 'dashboard'
    if (clientParam) return 'onboard'
    return 'upload'
  })

  const [vendors, setVendors] = useState(SAMPLE_VENDORS)
  const [budget, setBudget] = useState(SAMPLE_BUDGET)
  const [tasks, setTasks] = useState(SAMPLE_TASKS)
  const [usedSample, setUsedSample] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(googleResult === 'connected')
  const [clientDetails, setClientDetails] = useState(null)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  // If returning from Google OAuth and we already finished onboarding, fetch data
  useEffect(() => {
    if (googleResult === 'connected' && alreadyOnboarded) {
      setGoogleConnected(true)
      fetchGoogleData()
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname + (clientParam ? `?client=${clientParam}` : ''))
    }
  }, [])

  const fetchGoogleData = async () => {
    setLoadingGoogle(true)
    try {
      const res = await fetch('/api/google-data')
      if (!res.ok) return
      const data = await res.json()

      // Try to find a vendor/budget sheet
      for (const sheet of (data.sheets || [])) {
        const vendors = googleRowsToVendors(sheet.rows)
        if (vendors?.length) { setVendors(vendors); setUsedSample(false); break }
      }
      for (const sheet of (data.sheets || [])) {
        const budget = googleRowsToBudget(sheet.rows)
        if (budget?.length) { setBudget(budget); setUsedSample(false); break }
      }
    } catch {}
    finally { setLoadingGoogle(false) }
  }

  const handleOnboardComplete = async ({ googleConnected: gc, details }) => {
    setClientDetails(details)
    setGoogleConnected(gc)

    // Use wedding date from onboarding if provided
    if (details.weddingDate && tasks.length) {
      // Tasks stay as sample but dashboard will use the real date
    }

    if (gc) {
      await fetchGoogleData()
    } else {
      setUsedSample(true)
    }

    if (storageKey) localStorage.setItem(storageKey, JSON.stringify({ details, connectedAt: Date.now() }))

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname + (clientParam ? `?client=${clientParam}` : ''))
    setScreen('dashboard')
  }

  // Legacy CSV upload handler (for non-client direct access)
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
      {/* Banner: using sample data */}
      {usedSample && screen === 'dashboard' && !loadingGoogle && (
        <div style={{ background: '#FEF3E2', padding: '10px 32px', fontSize: 13, color: '#8C5A0A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>ⓘ</span>
          {googleConnected
            ? 'Connected to Google! No wedding spreadsheets found yet — using sample data. Share a Google Sheet with your vendor list to populate this automatically.'
            : 'Using sample data. Connect Google Sheets to populate your real vendors and budget.'
          }
          {!googleConnected && clientParam && (
            <a href={`/api/google-auth?return=${encodeURIComponent(window.location.href)}`}
              style={{ marginLeft: 8, color: '#8C5A0A', fontWeight: 600 }}>
              Connect Google →
            </a>
          )}
        </div>
      )}

      {/* Loading Google data banner */}
      {loadingGoogle && (
        <div style={{ background: '#EEF4ED', padding: '10px 32px', fontSize: 13, color: '#3A5C34', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔄</span> Pulling in your Google data…
        </div>
      )}

      {screen === 'onboard' && (
        <OnboardScreen clientName={clientName} onComplete={handleOnboardComplete} />
      )}
      {screen === 'upload' && (
        <UploadScreen onGenerate={handleGenerate} />
      )}
      {screen === 'dashboard' && (
        <Dashboard
          vendors={vendors}
          budget={budget}
          tasks={tasks}
          clientName={clientName}
          clientDetails={clientDetails}
          googleConnected={googleConnected}
          onReset={() => {
            if (storageKey) localStorage.removeItem(storageKey)
            setScreen(clientParam ? 'onboard' : 'upload')
            setUsedSample(false)
          }}
        />
      )}
    </>
  )
}
