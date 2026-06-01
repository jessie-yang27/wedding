export const WEDDING_DATE = new Date('2026-06-20T16:00:00')

export const SAMPLE_VENDORS = [
  { vendor: 'Grand Island Mansion', category: 'Venue', status: 'Complete', cost: 25000, dueDate: '' },
  { vendor: 'Vivi Photography', category: 'Photography', status: 'Payment Due', cost: 4500, dueDate: '2026-06-10' },
  { vendor: 'Florist', category: 'Flowers', status: 'Pending Approval', cost: 6000, dueDate: '2026-06-08' },
  { vendor: 'DJ / Band', category: 'Entertainment', status: 'Confirmed', cost: 3500, dueDate: '' },
  { vendor: 'Transportation', category: 'Logistics', status: 'Not Started', cost: 2500, dueDate: '2026-06-12' },
  { vendor: 'Rehearsal Dinner', category: 'Events', status: 'Incomplete', cost: 5000, dueDate: '2026-06-08' },
  { vendor: 'Hair & Makeup', category: 'Beauty', status: 'Confirmed', cost: 1800, dueDate: '' },
  { vendor: 'Officiant', category: 'Ceremony', status: 'Confirmed', cost: 600, dueDate: '' },
]

export const SAMPLE_BUDGET = [
  { category: 'Venue', budget: 30000, spent: 25000 },
  { category: 'Photography', budget: 5000, spent: 0 },
  { category: 'Flowers', budget: 7000, spent: 3000 },
  { category: 'Entertainment', budget: 4000, spent: 3500 },
  { category: 'Transportation', budget: 3000, spent: 0 },
  { category: 'Beauty', budget: 2000, spent: 1800 },
  { category: 'Rehearsal Dinner', budget: 6000, spent: 0 },
  { category: 'Miscellaneous', budget: 5000, spent: 2100 },
]

export const SAMPLE_TASKS = [
  { date: '2026-06-08', task: 'Finalize Florist Arrangements', priority: 'High' },
  { date: '2026-06-08', task: 'Rehearsal Dinner RSVPs', priority: 'High' },
  { date: '2026-06-10', task: 'Vivi Photography Final Payment', priority: 'High' },
  { date: '2026-06-12', task: 'Transportation Finalization', priority: 'High' },
  { date: '2026-06-14', task: 'Complete Seating Chart', priority: 'High' },
  { date: '2026-06-10', task: 'Finalize Signature Cocktails', priority: 'Medium' },
  { date: '2026-06-15', task: 'Day-of Timeline to Vendors', priority: 'Medium' },
  { date: '2026-06-18', task: 'Confirm All Vendor Arrival Times', priority: 'High' },
]

export function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

export function daysUntil(date) {
  const now = new Date()
  const diff = date - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
