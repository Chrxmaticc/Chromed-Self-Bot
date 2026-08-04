export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }

  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(401).json({ error: data.message || 'Invalid token' });
    }
    return res.json({ success: true, user: data });
  } catch (err) {
    return res.status(500).json({ error: 'Discord API unreachable' });
  }
}
