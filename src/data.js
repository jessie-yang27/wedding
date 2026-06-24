export const WEDDING_DATE = new Date('2026-06-20T16:00:00')

export const RSVP_OPTIONS = ['Pending', 'Yes', 'No']
export const MEAL_OPTIONS = ['', 'Chicken', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
export const SIDE_OPTIONS = ['Bride', 'Groom', 'Both']

export const GUEST_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'side', label: 'Side', type: 'select', options: SIDE_OPTIONS },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'rsvp', label: 'RSVP', type: 'select', options: RSVP_OPTIONS },
  { key: 'plusOne', label: 'Plus One', type: 'text' },
  { key: 'rehearsalDinner', label: 'Rehearsal Dinner', type: 'bool' },
  { key: 'table', label: 'Table', type: 'text' },
  { key: 'meal', label: 'Meal', type: 'select', options: MEAL_OPTIONS },
  { key: 'hotel', label: 'Hotel', type: 'text' },
  { key: 'dietary', label: 'Dietary / Notes', type: 'text' },
]

export const EMPTY_GUEST = {
  name: '', side: 'Both', email: '', phone: '', rsvp: 'Pending',
  plusOne: '', rehearsalDinner: false, table: '', meal: '', hotel: '', dietary: '',
}

export const SAMPLE_GUESTS = [
  { name: 'Lilian Park', side: 'Bride', email: 'lilian.park@example.com', phone: '209-555-0142', rsvp: 'Yes', plusOne: '', rehearsalDinner: true, table: '1', meal: 'Chicken', hotel: 'Hampton Inn and Suites', dietary: '' },
  { name: 'Kat Yang', side: 'Bride', email: 'kat.yang@example.com', phone: '209-555-0198', rsvp: 'Yes', plusOne: '', rehearsalDinner: true, table: '1', meal: 'Fish', hotel: 'Hampton Inn and Suites', dietary: 'No shellfish' },
  { name: 'Erin Zhu', side: 'Groom', email: 'erin.zhu@example.com', phone: '510-555-0110', rsvp: 'Yes', plusOne: 'Michael Chen', rehearsalDinner: true, table: '2', meal: 'Vegetarian', hotel: 'Hampton Inn and Suites', dietary: 'Vegetarian' },
  { name: 'Laurie Yang', side: 'Bride', email: 'laurie.yang@example.com', phone: '209-555-0177', rsvp: 'Yes', plusOne: 'Jerry Yang', rehearsalDinner: true, table: '1', meal: 'Chicken', hotel: '', dietary: '' },
  { name: 'Shan Zhu', side: 'Groom', email: 'shan.zhu@example.com', phone: '510-555-0133', rsvp: 'Yes', plusOne: '', rehearsalDinner: true, table: '2', meal: 'Fish', hotel: '', dietary: '' },
  { name: 'Tiffany Lee', side: 'Bride', email: 'tiffany.lee@example.com', phone: '916-555-0166', rsvp: 'Pending', plusOne: '', rehearsalDinner: false, table: '3', meal: '', hotel: 'Hampton Inn and Suites', dietary: '' },
  { name: 'James Wu', side: 'Groom', email: 'james.wu@example.com', phone: '510-555-0188', rsvp: 'No', plusOne: '', rehearsalDinner: false, table: '', meal: '', hotel: '', dietary: '' },
  { name: 'Cindy Tran', side: 'Bride', email: 'cindy.tran@example.com', phone: '916-555-0121', rsvp: 'Yes', plusOne: 'Eric Tran', rehearsalDinner: false, table: '4', meal: 'Vegan', hotel: 'Hampton Inn and Suites', dietary: 'Vegan' },
]

export function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 1) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

const HEADER_ALIASES = {
  name: ['name', 'guest', 'guest_name', 'full_name'],
  side: ['side', 'party'],
  email: ['email', 'email_address'],
  phone: ['phone', 'phone_number', 'cell'],
  rsvp: ['rsvp', 'rsvp_status', 'status'],
  plusOne: ['plus_one', 'plusone', 'guest_of'],
  rehearsalDinner: ['rehearsal_dinner', 'rehearsal'],
  table: ['table', 'table_number', 'table_#'],
  meal: ['meal', 'meal_choice', 'entree'],
  hotel: ['hotel', 'hotel_block'],
  dietary: ['dietary', 'dietary_notes', 'notes', 'allergies'],
}

export function rowsToGuests(rows) {
  if (!rows?.length) return []
  return rows.map(row => {
    const guest = { ...EMPTY_GUEST }
    Object.entries(HEADER_ALIASES).forEach(([field, aliases]) => {
      const key = aliases.find(a => row[a] !== undefined)
      if (key !== undefined && row[key] !== '') {
        guest[field] = field === 'rehearsalDinner' ? /^(y|yes|true|1)$/i.test(row[key]) : row[key]
      }
    })
    return guest
  }).filter(g => g.name)
}

export function guestsToCsvText(guests) {
  const headers = GUEST_FIELDS.map(f => f.key)
  const lines = [headers.join(',')]
  guests.forEach(g => {
    lines.push(headers.map(h => String(g[h] ?? '').replace(/,/g, ';')).join(','))
  })
  return lines.join('\n')
}

export function daysUntil(date) {
  const now = new Date()
  const diff = date - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
