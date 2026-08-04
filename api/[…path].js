// api/[...path].js
export default async function handler(req, res) {
  const { method, body, headers, query } = req;
  const token = headers.authorization?.replace('Bearer ', '') || body?.token;
  const pathSegments = query.path || []; // e.g. ['login']

  // Debug – visible in Vercel Functions Logs
  console.log(`[${new Date().toISOString()}] ${method} /api/${pathSegments.join('/')}`);

  // ----- LOGIN -----
  if (pathSegments[0] === 'login' && method === 'POST') {
    const { token: submittedToken } = body;
    if (!submittedToken) return res.status(400).json({ error: 'Token missing' });
    try {
      const resp = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { Authorization: `Bearer ${submittedToken}` },
      });
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Invalid token' });
      return res.json({ success: true, user: data });
    } catch (err) {
      return res.status(500).json({ error: 'Discord API unreachable' });
    }
  }

  // ----- ME -----
  if (pathSegments[0] === 'me' && method === 'GET') {
    if (!token) return res.status(401).json({ error: 'Token missing' });
    try {
      const resp = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Token expired' });
      return res.json({ success: true, user: data });
    } catch (err) {
      return res.status(500).json({ error: 'Discord API unreachable' });
    }
  }

  // ----- LOGOUT -----
  if (pathSegments[0] === 'logout') {
    return res.json({ success: true });
  }

  // ----- Unknown endpoint -----
  res.status(404).json({ error: `Unknown API endpoint: /api/${pathSegments.join('/')}` });
}
