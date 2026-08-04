export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) return res.status(401).json({ error: data.message || 'Token expired' });
    return res.json({ success: true, user: data });
  } catch (err) {
    return res.status(500).json({ error: 'Discord API unreachable' });
  }
}
