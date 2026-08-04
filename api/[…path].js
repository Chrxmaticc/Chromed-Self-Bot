// api/[...path].js
export default async function handler(req, res) {
  const { method, body, headers, query } = req;
  const token = headers.authorization?.replace('Bearer ', '') || body?.token;
  const pathSegments = query.path || []; // safe fallback

  // Helper to call Discord API
  const discordRequest = async (endpoint, options = {}) => {
    const url = `https://discord.com/api/v9${endpoint}`;
    const response = await fetch(url, {
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
    if (pathSegments[0] === 'login' && method === 'POST') {
      const { token: submittedToken } = body;
      if (!submittedToken) return res.status(400).json({ error: 'Token missing' });

      const resp = await fetch('https://discord.com/api/v9/users/@me', {
        headers: { Authorization: `Bearer ${submittedToken}` },
      });
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Invalid token' });

      return res.json({ success: true, user: data });
    }

    // ----- ME (check stored token) -----
    if (pathSegments[0] === 'me' && method === 'GET') {
      if (!token) return res.status(401).json({ error: 'Token missing' });

      const resp = await discordRequest('/users/@me');
      const data = await resp.json();
      if (!resp.ok) return res.status(401).json({ error: data.message || 'Token invalid' });

      return res.json({ success: true, user: data });
    }

    // ----- LOGOUT (just acknowledge) -----
    if (pathSegments[0] === 'logout') {
      return res.json({ success: true });
    }

    // ----- Fallback: unknown endpoint -----
    res.status(404).json({ error: `Unknown API endpoint: /${pathSegments.join('/')}` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
