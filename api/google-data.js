// Fetch Gmail threads + Google Sheets data using the stored token cookie
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const cookie = req.headers.cookie || ''
  const tokenMatch = cookie.match(/gtoken=([^;]+)/)
  if (!tokenMatch) return res.status(401).json({ error: 'Not connected to Google' })

  let tokens
  try {
    tokens = JSON.parse(Buffer.from(tokenMatch[1], 'base64').toString())
  } catch {
    return res.status(401).json({ error: 'Invalid token cookie' })
  }

  // Refresh if expired
  let accessToken = tokens.access_token
  if (Date.now() > tokens.expiry - 60000) {
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    const refreshed = await refreshRes.json()
    if (refreshed.access_token) {
      accessToken = refreshed.access_token
      // Update cookie
      const newPayload = Buffer.from(JSON.stringify({
        access_token: refreshed.access_token,
        refresh_token: tokens.refresh_token,
        expiry: Date.now() + refreshed.expires_in * 1000,
      })).toString('base64')
      res.setHeader('Set-Cookie', `gtoken=${newPayload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`)
    }
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` }

  try {
    const [gmailData, sheetsData] = await Promise.all([
      fetchGmailVendorThreads(authHeader),
      fetchWeddingSheets(authHeader),
    ])

    res.status(200).json({ gmail: gmailData, sheets: sheetsData })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function fetchGmailVendorThreads(headers) {
  // Cast a wide net — wedding vendors, quotes, contracts, invoices
  const query = encodeURIComponent(
    'subject:(venue OR catering OR florist OR photographer OR wedding OR DJ OR band OR officiant OR rehearsal OR contract OR invoice OR quote OR proposal OR deposit OR caterer OR videographer OR hair OR makeup OR transportation OR hotel OR accommodation)'
  )
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${query}&maxResults=30`,
    { headers }
  )
  const list = await listRes.json()
  if (!list.threads) return []

  const threads = await Promise.all(
    list.threads.slice(0, 20).map(async t => {
      const threadRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        { headers }
      )
      const thread = await threadRes.json()
      const msg = thread.messages?.[0]
      const subject = msg?.payload?.headers?.find(h => h.name === 'Subject')?.value || '(no subject)'
      const from = msg?.payload?.headers?.find(h => h.name === 'From')?.value || ''
      const date = msg?.payload?.headers?.find(h => h.name === 'Date')?.value || ''
      // Guess vendor name from sender display name
      const senderName = from.replace(/<.*>/, '').replace(/"/g, '').trim()
      return { id: t.id, subject, from, senderName, date, snippet: msg?.snippet || '', messageCount: thread.messages?.length || 1 }
    })
  )
  return threads
}

async function fetchWeddingSheets(headers) {
  // Broad search — any spreadsheet (user will pick the right one in the UI)
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'")
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=20&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)`,
    { headers }
  )
  const drive = await driveRes.json()
  if (!drive.files?.length) return []

  // Pull all tab names first, then fetch each tab's data
  const sheets = await Promise.all(
    drive.files.map(async file => {
      // Get sheet metadata to find all tab names
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${file.id}?fields=sheets.properties`,
        { headers }
      )
      const meta = await metaRes.json()
      const tabs = meta.sheets?.map(s => s.properties?.title).filter(Boolean) || ['Sheet1']

      // Fetch all tabs
      const tabData = await Promise.all(
        tabs.map(async tab => {
          const sheetRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${file.id}/values/${encodeURIComponent(tab)}!A1:Z200`,
            { headers }
          )
          const data = await sheetRes.json()
          return { tab, rows: data.values || [] }
        })
      )
      return { id: file.id, name: file.name, modified: file.modifiedTime, tabs: tabData }
    })
  )
  return sheets
}
