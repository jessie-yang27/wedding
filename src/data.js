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

const MESSAGES_KEY = 'message_center'

export const EMPTY_MESSAGE_CENTER = {
  drafts: [],
  sent: [],
  emailColumnKey: '',
  phoneColumnKey: '',
}

export const MESSAGE_TEMPLATES = [
  {
    label: 'Save the Date',
    type: 'email',
    subject: 'Save the Date — {{coupleName}}',
    body: "Hi {{firstName}},\n\nWe're getting married! Please save the date for {{weddingDate}} at {{venue}}. A formal invitation will follow.\n\nWith love,\n{{coupleName}}",
  },
  {
    label: 'Wedding Invitation',
    type: 'email',
    subject: "You're Invited — {{coupleName}}'s Wedding",
    body: 'Dear {{firstName}},\n\nWe would be honored to have you join us as we celebrate our wedding on {{weddingDate}} at {{venue}}.\n\nPlease let us know if you can make it.\n\nLove,\n{{coupleName}}',
  },
  {
    label: 'RSVP Reminder',
    type: 'text',
    body: "Hi {{firstName}}! Friendly reminder to RSVP for {{coupleName}}'s wedding on {{weddingDate}}. We'd love to know if you can make it.",
  },
  {
    label: 'Thank You',
    type: 'text',
    body: 'Hi {{firstName}}, thank you so much for celebrating with us at {{venue}}! It meant the world to have you there. With love, {{coupleName}}',
  },
]

export function loadMessages() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    return raw ? { ...EMPTY_MESSAGE_CENTER, ...JSON.parse(raw) } : { ...EMPTY_MESSAGE_CENTER }
  } catch {
    return { ...EMPTY_MESSAGE_CENTER }
  }
}

export function saveMessages(state) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(state))
}

const SEATING_KEY = 'seating_chart'

export const EMPTY_SEATING = {
  assignments: {}, // guestRowId -> table number (string)
  tableCount: 10,
  capacity: 8,
}

export function loadSeating() {
  try {
    const raw = localStorage.getItem(SEATING_KEY)
    return raw ? { ...EMPTY_SEATING, ...JSON.parse(raw) } : { ...EMPTY_SEATING }
  } catch {
    return { ...EMPTY_SEATING }
  }
}

export function saveSeating(state) {
  localStorage.setItem(SEATING_KEY, JSON.stringify(state))
}
