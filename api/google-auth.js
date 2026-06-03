// Step 1: redirect user to Google's OAuth consent screen
export default function handler(req, res) {
  const returnUrl = req.query.return || '/'
  const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64')

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:5173'}/api/google-callback`,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
