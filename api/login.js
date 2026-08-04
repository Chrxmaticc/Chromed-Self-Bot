export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let token = req.body.token;
  if (!token) return res.status(400).json({ error: 'Token missing' });
  token = token.replace(/^["']|["']$/g, '').trim();

  const superProps = Buffer.from(JSON.stringify({
    os: 'Windows',
    browser: 'Discord Client',
    release_channel: 'stable',
    client_version: '1.0.9013',
    os_version: '10.0.19045',
    os_arch: 'x64',
    system_locale: 'en-US',
    client_build_number: 234123,
    client_event_source: null
  })).toString('base64');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9013 Chrome/108.0.5359.215 Electron/22.3.18 Safari/537.36',
    'X-Super-Properties': superProps,
    'X-Discord-Locale': 'en-US',
    'X-Debug-Options': 'bugReporterEnabled',
    'Referer': 'https://discord.com/channels/@me',
    'Origin': 'https://discord.com',
  };

  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', { headers });
    const data = await response.json();
    if (!response.ok) {
      console.log('Discord response:', data);
      return res.status(401).json({ error: data.message || 'Invalid token' });
    }
    return res.json({ success: true, user: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
