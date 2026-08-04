export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract token and clean it
  let token = req.body.token;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  // Remove quotes, whitespace, newlines, and any invisible characters
  token = token.replace(/^["']|["']$/g, '').trim();

  console.log('Cleaned token (first 10):', token.slice(0, 10) + '...');

  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Discord rejected token:', data);
      return res.status(401).json({ error: data.message || 'Invalid token' });
    }

    return res.json({ success: true, user: data });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Discord API unreachable' });
  }
}
