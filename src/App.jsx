import { useState, useEffect } from 'react'
import OnboardScreen from './OnboardScreen'
import UploadScreen from './UploadScreen'
import ImportScreen from './ImportScreen'
import Dashboard from './Dashboard'
import { SAMPLE_VENDORS, SAMPLE_BUDGET, SAMPLE_TASKS, parseCsv } from './data'

function clientNameFromParam(param) {
  if (!param) return null
  return param.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Apply user-defined column map to rows → vendors + budget arrays
function applyColumnMap(rows, columnMap) {
  if (!rows?.length || !columnMap) return { vendors: null, budget: null }

  const headers = rows[0]
  const dataRows = rows.slice(1).filter(r => r.some(c => c?.trim()))

  // Build objects using the column map
  const mapped = dataRows.map(row => {
    const obj = {}
    headers.forEach((h, i) => {
      const field = columnMap[h]
      if (field) obj[field] = row[i] || ''
    })
    return obj
  })

  // Detect if this looks like a vendor sheet or budget sheet
  const hasVendorField = mapped[0] && ('vendor' in mapped[0] || 'category' in mapped[0] || 'status' in mapped[0])
  const hasBudgetField = mapped[0] && ('budget' in mapped[0] || 'spent' in mapped[0])

  const vendors = hasVendorField ? mapped.map(r => ({
    vendor: r.vendor || '',
    category: r.category || '',
    status: r.status || 'Not Started',
    cost: parseFloat(r.cost) || 0,
    dueDate: r.dueDate || '',
  })).filter(v => v.vendor) : null

  const budget = hasBudgetField ? mapped.map(r => ({
    category: r.category || r.vendor || '',
    budget: parseFloat(r.budget) || 0,
    spent: parseFloat(r.spent) || 0,
  })).filter(b => b.category) : null

  return { vendors, budget }
}

// Auto-detect columns by fuzzy-matching header names
function autoDetectColumnMap(headers) {
  const map = {}
  const rules = {
    vendor: ['vendor', 'name', 'company', 'supplier', 'contact'],
    category: ['category', 'type', 'service'],
    status: ['status', 'state', 'stage'],
    cost: ['cost', 'price', 'amount', 'fee', 'total'],
    dueDate: ['due', 'date', 'deadline', 'payment date'],
    budget: ['budget', 'budgeted', 'allocated'],
    spent: ['spent', 'actual', 'paid', 'invoiced'],
  }
  headers.forEach(h => {
    const lower = h.toLowerCase().trim()
    for (const [field, keywords] of Object.entries(rules)) {
      if (keywords.some(k => lower.includes(k))) {
        if (!Object.values(map).includes(field)) map[h] = field
        break
      }
    }
  })
  return map
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const clientParam = params.get('client')
  const clientName = clientNameFromParam(clientParam)
  const googleResult = params.get('google')

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
  const [googleConnected, setGoogleConnected] = useState(false)
  const [clientDetails, setClientDetails] = useState(null)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [googleData, setGoogleData] = useState(null)

  // Returning from Google OAuth
  useEffect(() => {
    if (googleResult === 'connected') {
      setGoogleConnected(true)
      window.history.replaceState({}, '', window.location.pathname + (clientParam ? `?client=${clientParam}` : ''))
      fetchGoogleData()
    }
  }, [])

  const fetchGoogleData = async () => {
    setLoadingGoogle(true)
    try {
      const res = await fetch('/api/google-data')
      if (!res.ok) return
      const data = await res.json()
      setGoogleData(data)
      setScreen('import')
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingGoogle(false)
    }
  }

  const handleImport = ({ threads, rows, columnMap, sheetName }) => {
    // Auto-detect any unmapped columns
    const headers = rows[0] || []
    const autoMap = autoDetectColumnMap(headers)
    const mergedMap = { ...autoMap, ...columnMap }

    const { vendors: importedVendors, budget: importedBudget } = applyColumnMap(rows, mergedMap)

    // Also pull vendor names from Gmail threads as a supplemental vendor list
    const gmailVendors = threads
      .filter(t => t.senderName && t.senderName.length > 1)
      .map(t => ({
        vendor: t.senderName,
        category: '',
        status: 'Not Started',
        cost: 0,
        dueDate: '',
      }))

    if (importedVendors?.length) {
      setVendors(importedVendors)
      setUsedSample(false)
    } else if (gmailVendors.length) {
      setVendors(gmailVendors)
      setUsedSample(false)
    } else {
      setUsedSample(true)
    }

    if (importedBudget?.length) {
      setBudget(importedBudget)
    }

    if (storageKey) {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}')
      localStorage.setItem(storageKey, JSON.stringify({ ...existing, importedAt: Date.now() }))
    }

    setScreen('dashboard')
  }

  const handleOnboardComplete = async ({ googleConnected: gc, details }) => {
    setClientDetails(details)
    setGoogleConnected(gc)
    if (gc) {
      await fetchGoogleData()
    } else {
      setUsedSample(true)
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify({ details, connectedAt: Date.now() }))
      setScreen('dashboard')
    }
  }

  const handleGenerate = (files, notes) => {
    let parsedVendors = SAMPLE_VENDORS
    let parsedBudget = SAMPLE_BUDGET
    let parsedTasks = SAMPLE_TASKS

    if (files.vendors) {
      try {
        const rows = parseCsv(files.vendors)
        if (rows.length) parsedVendors = rows.map(r => ({ vendor: r.vendor, category: r.category, status: r.status, cost: parseFloat(r.cost) || 0, dueDate: r.duedate || r.due_date || '' }))
      } catch {}
    }
    if (files.budget) {
      try {
        const rows = parseCsv(files.budget)
        if (rows.length) parsedBudget = rows.map(r => ({ category: r.category, budget: parseFloat(r.budget) || 0, spent: parseFloat(r.spent) || 0 }))
      } catch {}
    }
    if (files.timeline) {
      try {
        const rows = parseCsv(files.timeline)
        if (rows.length) parsedTasks = rows.map(r => ({ date: r.date, task: r.task, priority: r.priority || 'Medium' }))
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
      {loadingGoogle && (
        <div style={{ background: '#EEF4ED', padding: '10px 32px', fontSize: 13, color: '#3A5C34', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔄</span> Scanning your Google account…
        </div>
      )}

      {screen === 'onboard' && (
        <OnboardScreen clientName={clientName} onComplete={handleOnboardComplete} />
      )}
      {screen === 'upload' && (
        <UploadScreen onGenerate={handleGenerate} onConnectGoogle={fetchGoogleData} />
      )}
      {screen === 'import' && googleData && (
        <ImportScreen
          googleData={googleData}
          onImport={handleImport}
          onSkip={() => { setUsedSample(true); setScreen('dashboard') }}
        />
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
            setGoogleData(null)
          }}
        />
      )}
    </>
  )
}
