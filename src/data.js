const WEDDING_INFO_KEY = 'wedding_info'
const GUEST_SHEET_KEY = 'guest_sheet'

export const EMPTY_WEDDING_INFO = {
  coupleName: '',
  weddingDate: '',
  venue: '',
}

export const COLOR_PALETTE = ['#F0D4D4', '#F0E4C8', '#DCE8D4', '#D4E4F0', '#E0D4F0', '#F0D4E8', '#D4ECE0', '#E8DCC8']

export const SUGGESTED_FIELDS = [
  { label: 'Email', type: 'text', options: [] },
  { label: 'Phone', type: 'text', options: [] },
  { label: 'Address', type: 'text', options: [] },
  { label: 'Plus One', type: 'text', options: [] },
  { label: 'Table Number', type: 'number', options: [] },
  { label: 'RSVP Status', type: 'select', options: [{ value: 'Yes', color: '#DCE8D4' }, { value: 'No', color: '#F0D4D4' }, { value: 'Pending', color: '#F0E4C8' }] },
  { label: 'Meal Choice', type: 'select', options: [{ value: 'Chicken', color: '#F0E4C8' }, { value: 'Fish', color: '#D4E4F0' }, { value: 'Vegetarian', color: '#DCE8D4' }] },
]

export const DEFAULT_COLUMNS = [
  { key: 'firstName', label: 'First Name', type: 'text', options: [] },
  { key: 'lastName', label: 'Last Name', type: 'text', options: [] },
  {
    key: 'tier', label: 'Tier', type: 'select',
    options: [
      { value: 'Tier 0', color: '#F0D4D4' },
      { value: 'Tier 1', color: '#F0E4C8' },
      { value: 'Tier 2', color: '#D4E4F0' },
      { value: 'Tier 3', color: '#DCE8D4' },
    ],
  },
  { key: 'relationship', label: 'Relationship', type: 'text', options: [] },
]

function normalizeOptions(options) {
  if (!Array.isArray(options)) return []
  return options.map((o, i) => (typeof o === 'string' ? { value: o, color: COLOR_PALETTE[i % COLOR_PALETTE.length] } : o))
}

function normalizeColumns(columns) {
  return columns.map(c => ({ ...c, options: normalizeOptions(c.options) }))
}

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
      columns: parsed.columns?.length ? normalizeColumns(parsed.columns) : DEFAULT_COLUMNS,
      rows: parsed.rows || [],
    }
  } catch {
    return { columns: DEFAULT_COLUMNS, rows: [] }
  }
}

export function saveGuestSheet(sheet) {
  localStorage.setItem(GUEST_SHEET_KEY, JSON.stringify(sheet))
}
