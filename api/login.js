export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const rawToken = req.body.token;
  // Show exactly what the backend sees (first 15 chars)
  return res.json({
    received: rawToken ? rawToken.slice(0, 15) + '...' : 'MISSING',
    length: rawToken ? rawToken.length : 0,
    rawFirstCharCode: rawToken ? rawToken.charCodeAt(0) : null,
  });
}
