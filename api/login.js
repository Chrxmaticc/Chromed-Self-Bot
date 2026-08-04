export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const raw = req.body.token;
  const token = raw ? raw.replace(/^["']|["']$/g, '').trim() : '';

  // Build debug info
  const debug = {
    receivedLength: raw ? raw.length : 0,
    cleanedLength: token.length,
    firstChars: token.slice(0, 15) + (token.length > 15 ? '...' : ''),
    firstCharCode: token.charCodeAt(0) || null,
    hasBearer: token.startsWith('Bearer '),
  };

  if (!token) {
    return res.status(400).json({ error: 'Token missing', debug });
  }

  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    debug.discordStatus = response.status;
    debug.discordBody = data;

    if (!response.ok) {
      return res.status(401).json({ error: data.message || 'Invalid token', debug });
    }

    return res.json({ success: true, user: data, debug });
  } catch (err) {
    return res.status(500).json({ error: err.message, debug });
  }
}
