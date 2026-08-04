export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname; // e.g., "/api/login"

  const { method, body, headers } = req;
  const token = headers.authorization?.replace('Bearer ', '') || body?.token;

  // Helper to call Discord
  const discordRequest = async (endpoint, options = {}) => {
    const response = await fetch(`https://discord.com/api/v9${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  };

  try {
    // ----- LOGIN -----
    if (pathname === '/api/login' && method === 'POST') {
      const { token: submittedToken } = body;
      if (!submittedToken) return res.status(400).json({ error: 'Token missing' });
      const resp = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { Authorization: `Bearer ${submittedToken}` },
      });
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Invalid token' });
      return res.json({ success: true, user: data });
    }

    // ----- ME -----
    if (pathname === '/api/me' && method === 'GET') {
      if (!token) return res.status(401).json({ error: 'Token missing' });
      const resp = await discordRequest('/users/@me');
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Token expired' });
      return res.json({ success: true, user: data });
    }

    // ----- LOGOUT -----
    if (pathname === '/api/logout') {
      return res.json({ success: true });
    }

    // ----- Unknown -----
    res.status(404).json({ error: `Unknown endpoint: ${pathname}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
