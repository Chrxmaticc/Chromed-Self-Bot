// api/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  const method = req.method;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;

  // Helper to proxy to Discord API
  const discordRequest = async (endpoint, options = {}) => {
    const url = `https://discord.com/api/v9${endpoint}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    return response;
  };

  try {
    // ----- LOGIN / ME -----
    if (path[0] === 'login' && method === 'POST') {
      const { token: submittedToken } = req.body;
      const resp = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { Authorization: `Bearer ${submittedToken}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Invalid token');
      return res.json({ success: true, user: data });
    }

    if (path[0] === 'me' && method === 'GET') {
      const resp = await discordRequest('/users/@me');
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: 'Token expired' });
      return res.json({ success: true, user: data });
    }

    // ----- LOGOUT (just return success) -----
    if (path[0] === 'logout') {
      return res.json({ success: true });
    }

    // Default fallback
    res.status(404).json({ error: 'Endpoint not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
