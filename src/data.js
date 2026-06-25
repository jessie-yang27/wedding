const WEDDING_INFO_KEY = 'wedding_info'
const GUEST_SHEET_KEY = 'guest_sheet'

export const EMPTY_WEDDING_INFO = {
  coupleName: '',
  weddingDate: '',
  venue: '',
}

export const DEFAULT_COLUMNS = [
  { key: 'firstName', label: 'First Name', type: 'text', options: [] },
  { key: 'lastName', label: 'Last Name', type: 'text', options: [] },
  { key: 'tier', label: 'Tier', type: 'select', options: ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3'] },
  { key: 'relationship', label: 'Relationship', type: 'text', options: [] },
]

export function loadWeddingInfo() {
  try {
    const raw = localStorage.getItem(WEDDING_INFO_KEY)
    return raw ? { ...EMPTY_WEDDING_INFO, ...JSON.parse(raw) } : { ...EMPTY_WEDDING_INFO }
  } catch {
    return { ...EMPTY_WEDDING_INFO }
  }
}

export function saveWeddingInfo(info) {
  localStorage.setItem(WEDDING_INFO_KEY, JSON.stringify(info))
}

let idCounter = 1
export function nextId() {
  return idCounter++
}

export function loadGuestSheet() {
  try {
    const raw = localStorage.getItem(GUEST_SHEET_KEY)
    if (!raw) return { columns: DEFAULT_COLUMNS, rows: [] }
    const parsed = JSON.parse(raw)
    const maxId = parsed.rows?.reduce((m, r) => Math.max(m, r.id || 0), 0) || 0
    idCounter = maxId + 1
    return {
      columns: parsed.columns?.length ? parsed.columns : DEFAULT_COLUMNS,
      rows: parsed.rows || [],
    }
  } catch {
    return { columns: DEFAULT_COLUMNS, rows: [] }
  }
}

export function saveGuestSheet(sheet) {
  localStorage.setItem(GUEST_SHEET_KEY, JSON.stringify(sheet))
}
