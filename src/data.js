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

export const SAMPLE_DAY_TIMELINE = [
  { time: '7:45 AM', endTime: '8:00 AM', title: "HMUA Team Arrive at Jessie's Airbnb", location: '8129 Champart Cir, Elk Grove, CA 95758', notes: 'Wedding Party: Set Up Breakfast + Snack Items' },
  { time: '8:00 AM', endTime: '11:00 AM', title: 'Hair and Makeup Schedule', location: '', notes: '8:00am Jessie & MOH (Lilian); 9:00am Sister in law (Erin); 10:00am Mother (Laurie) & Sister (Kat); 10:30am Bride make-up done; 11:00am All Hair & Makeup Completed' },
  { time: '11:00 AM', endTime: '11:30 AM', title: 'Bridesmaids + Groomsmen Exit to Venue', location: '13415 Grand Island Rd, Walnut Grove, CA 95690', notes: 'Christy (HMUA) exits to venue' },
  { time: '11:00 AM', endTime: '', title: 'Venue Opens for Set Up', location: '', notes: 'Athena (Planner) + Sam (Coordinator) arrive; Ceremony set up (welcome table, cocktail area); Reception setup (seating chart, rentals, table numbers, place cards, menus, decor); Jinjing & Team (Florist) arrive — flat lay florals, bouquets, boutonnières & corsages on 2nd floor; begin ceremony & reception setup' },
  { time: '11:45 AM', endTime: '12:00 PM', title: 'Ana & Bruna Arrive (Content Creators)', location: '', notes: '' },
  { time: '12:00 PM', endTime: '12:30 PM', title: 'Photo Team Arrive, Content Services Begin', location: '', notes: 'Detail shots: flat lays / personal items; Bridal party preps champagne & sparkling cider' },
  { time: '1:00 PM', endTime: '2:15 PM', title: 'Wedding Party Content', location: "Lizst Suite / Groom's Suite", notes: 'Bridesmaid photos in pajamas; Laurie (Mom) helps Bride into dress; Bride first look with bridal party; Groom solo portraits; Groom + Dad; Groomsmen group photos' },
  { time: '2:35 PM', endTime: '3:00 PM', title: 'B&G Portraits', location: '', notes: '' },
  { time: '2:45 PM', endTime: '3:00 PM', title: 'Guest Shuttle Arrives at Hotel (40 Guest Pick Up)', location: '', notes: 'XX Event Productions (DJ + MC) arrive' },
  { time: '3:00 PM', endTime: '3:15 PM', title: 'Ceremony + Welcome Area Fully Set', location: '', notes: 'Florals at pillars + aisle set; Welcome table + cocktail area set; Musicians arrive' },
  { time: '3:00 PM', endTime: '3:20 PM', title: 'Wedding Party Photos', location: '', notes: '' },
  { time: '3:20 PM', endTime: '3:35 PM', title: 'Family Photos + Ceremony Details', location: '', notes: 'Main shooter: family photos; second shooter: ceremony details' },
  { time: '3:30 PM', endTime: '3:45 PM', title: 'Guest Arrival and Musician Prelude Begins', location: '', notes: 'Shuttle arrives + guests in personal cars' },
  { time: '3:35 PM', endTime: '3:50 PM', title: 'Wedding Party Hides in Mansion', location: '', notes: 'Touch ups, restroom break, etc.; Christy (HMUA) does final touch ups' },
  { time: '3:50 PM', endTime: '4:00 PM', title: 'Wedding Party Lines Up in Foyer', location: '', notes: 'Christy (HMUA) exits at 4pm' },
  { time: '3:50 PM', endTime: '3:55 PM', title: 'Kenken (MC) Excuses Guests to Find Their Seats', location: '', notes: 'Reminder for no phones during the ceremony' },
  { time: '4:00 PM', endTime: '4:30 PM', title: 'Ceremony Begins', location: '', notes: "Athena cues Kenken (MC) to begin; Kenken's welcome greeting, then cues musicians; Song: Can't Help Falling in Love" },
  { time: '4:05 PM', endTime: '4:15 PM', title: 'Processional', location: '', notes: "Song: Can't Help Falling in Love — 1. Patrick + Shan (Dad); 2. Liz w/ Tiffany; 3. Claudia w/ Cindy; 4. Krithika w/ Gowri; 5. Tarun w/ Jessica (song change: Wildest Dreams); 6. Eric w/ Erin; 7. Michael w/ Laurie; 8. James w/ Lilian; 9. Chin w/ Kat (song change: Thousand Years); 10. Lyndia (Flower Girl); 11. Bride Jessie + Jerry (Dad)" },
  { time: '4:15 PM', endTime: '4:25 PM', title: 'Ceremony Program', location: '', notes: 'Opening remarks; Love story; Meaning of marriage; Declaration of intent; Exchange of vows; Ring exchange; Pronouncement + first kiss; Presentation: "Jessie & Patrick"' },
  { time: '4:25 PM', endTime: '4:30 PM', title: 'Recessional', location: '', notes: 'Song: Here Comes The Sun (instrumental) — 1. Jessie & Patrick; 2. Lilian & Chin; 3. Kathleen & James; 4. Erin & Michael. Guests excused to cocktail hour (Pagoda Area); family stays for photos' },
  { time: '4:30 PM', endTime: '5:15 PM', title: 'Cocktail Hour Begins', location: 'Pagoda Area', notes: 'B&G photos at Pillar Stage (2-5 min); Group family + extended family photos (Backyard, 10 min); Wedding party photos (Backyard, 10 min); GIM serves passed appetizers + champagne; Florist repurposes ceremony flowers for reception' },
  { time: '5:00 PM', endTime: '5:15 PM', title: 'Collonade Room (Reception) Fully Set', location: 'Collonade Room', notes: 'No guests or vendors/staff please' },
  { time: '5:15 PM', endTime: '5:30 PM', title: 'Guests Excused Indoors', location: 'Collonade Room', notes: "Note for Kenken: wait for Athena's cue; Indoor dining room + bar opens; Jessie & Patrick join cocktail hour" },
  { time: '5:30 PM', endTime: '', title: 'Live Music Conclusion, Trio Exits', location: '', notes: '' },
  { time: '5:30 PM', endTime: '5:35 PM', title: 'Guests Find Their Seats', location: 'Collonade Room', notes: 'Jessie & Patrick standby in Foyer for intros' },
  { time: '5:35 PM', endTime: '5:45 PM', title: "Kenken's Opening Remarks", location: '', notes: "Parent introductions (seated): Jessie's parents Mr. Zhu & Ms. Liao; Patrick's dad & wife Mr. Yang & Ms. Liu; Grand intro: Celebration by Kool & The Gang; Bride & Groom welcome speech" },
  { time: '5:45 PM', endTime: '6:15 PM', title: 'Salad Service Begins', location: '', notes: "Parent toasts after salad served: Jessie's parents Laurie + Jerry; Patrick's dad Shan" },
  { time: '6:20 PM', endTime: '6:50 PM', title: 'Main Course Service Begins', location: 'Vendor meals served in Versailles Room', notes: 'Toasts after main course: Kat & Michael (Bride siblings); Erin (Groom sibling); Lilian (MOH); Chin (BM)' },
  { time: '6:50 PM', endTime: '7:00 PM', title: 'Guests Excused to Backyard', location: 'Backyard', notes: 'Ask guests to bring belongings; Florist repurposes ground arrangements to backyard' },
  { time: '6:50 PM', endTime: '7:10 PM', title: 'Jessie Dress Change', location: '', notes: '' },
  { time: '7:00 PM', endTime: '10:30 PM', title: 'Outdoor Bar Opens', location: 'Backyard', notes: 'Signature drinks: Patrick - Grapefruit Highball; Jessie - Pink Cranberry Mule' },
  { time: '7:00 PM', endTime: '7:15 PM', title: 'Musical Scavenger Hunt', location: 'Backyard Dance Floor', notes: 'Coordinator places 6 chairs on dance floor' },
  { time: '7:15 PM', endTime: '7:25 PM', title: 'B&G Entrance + First Dance', location: 'Dance Floor', notes: "Entrance: Can't Take My Eyes Off of You by Frankie Valli; First dance: L.O.V.E. by Nat King Cole; Dance floor opens to Dancing Queen by ABBA" },
  { time: '7:45 PM', endTime: '8:15 PM', title: 'Cake + Champagne + Dessert Table Set Up', location: 'Backyard, Near Dance Floor + Tent', notes: '' },
  { time: '7:45 PM', endTime: '8:10 PM', title: 'B&G Sunset Photos', location: 'Front of Mansion, Ceremony Courtyard, Lake', notes: '' },
  { time: '8:15 PM', endTime: '8:25 PM', title: 'Unannounced Cake Cutting + Champagne Pour', location: 'Near Dance Floor, Backyard', notes: 'Song: Today Was A FairyTale by Taylor Swift' },
  { time: '8:25 PM', endTime: '', title: 'Kenken Announces Dessert Table Opens', location: 'Near Tent, Backyard', notes: 'Espresso bar + ice cream sundae buffet opens indoors, Ballroom Level' },
  { time: '8:45 PM', endTime: '', title: 'Karaoke Station Opens (Announced)', location: 'Indoor Ballroom', notes: 'Mahjong + card tables ready' },
  { time: '9:00 PM', endTime: '', title: 'Vivi Lin + Photo Team Exit', location: '', notes: '' },
  { time: '10:00 PM', endTime: '', title: 'Ana & Bruna Exit (Content Creators)', location: '', notes: '' },
  { time: '11:00 PM', endTime: '12:00 AM', title: 'Conclusion', location: '', notes: 'Strike begins: photo booth, florist rentals, DJ, etc.; assigned guest(s) take B&G personal decorations (Athena packs up); shuttle arrives in parking lot; 11:30pm all non-overnight guests must exit, mansion closed, all items removed; 12am all vendors exit' },
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
