// Step 2: Google redirects here with an auth code — exchange it for tokens
export default async function handler(req, res) {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect('/?google=denied')
  }

  let returnUrl = '/'
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
    returnUrl = decoded.returnUrl || '/'
  } catch {}

  const baseUrl = process.env.REDIRECT_BASE_URL || 'http://localhost:5173'

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/google-callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Token exchange failed')

    // Store tokens in a short-lived cookie (session)
    // In production you'd use a proper session store; for now we encode in a cookie
    const tokenPayload = Buffer.from(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry: Date.now() + tokens.expires_in * 1000,
    })).toString('base64')

    res.setHeader('Set-Cookie', `gtoken=${tokenPayload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`)

    // Redirect back to the app with a success signal
    const separator = returnUrl.includes('?') ? '&' : '?'
    res.redirect(`${returnUrl}${separator}google=connected`)
  } catch (err) {
    console.error('Google OAuth error:', err)
    res.redirect(`${returnUrl}?google=error&msg=${encodeURIComponent(err.message)}`)
  }
}
