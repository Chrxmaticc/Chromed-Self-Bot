export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let token = req.body.token;
  if (!token) return res.status(400).json({ error: 'Token missing' });
  token = token.replace(/^["']|["']$/g, '').trim();

  // ---- 1. Gather every IP-related header from the client ----
  const clientIP = req.headers['cf-connecting-ip'] ||          // Cloudflare
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.connection?.remoteAddress || '';

  // ---- 2. Gather every client fingerprint header ----
  const clientUA = req.headers['user-agent'] || '';
  const acceptLang = req.headers['accept-language'] || 'en-US';
  const secChUa = req.headers['sec-ch-ua'] || '';
  const secChUaMobile = req.headers['sec-ch-ua-mobile'] || '?0';
  const secChUaPlatform = req.headers['sec-ch-ua-platform'] || '';

  // ---- 3. Build Super Properties based on client's actual OS ----
  let os = 'Windows';
  let osVersion = '10.0.19045';
  let browser = 'Discord Client';
  if (clientUA.includes('Android')) {
    os = 'Android'; osVersion = '13'; browser = 'Discord Android';
  } else if (clientUA.includes('iPhone') || clientUA.includes('iPad')) {
    os = 'iOS'; osVersion = '16.6'; browser = 'Discord iOS';
  } else if (clientUA.includes('Mac OS X')) {
    os = 'Mac OS X'; osVersion = '13.4'; browser = 'Discord Desktop';
  }

  const superProperties = Buffer.from(JSON.stringify({
    os,
    browser,
    release_channel: 'stable',
    client_version: '1.0.9013',
    os_version: osVersion,
    os_arch: 'x64',
    system_locale: acceptLang.split(',')[0] || 'en-US',
    client_build_number: 234123,
    client_event_source: null
  })).toString('base64');

  // ---- 4. Build Discord request headers with everything ----
  const discordHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': clientUA,
    'X-Super-Properties': superProperties,
    'X-Discord-Locale': acceptLang.split(',')[0] || 'en-US',
    'X-Debug-Options': 'bugReporterEnabled',
    'X-Forwarded-For': clientIP,
    'X-Real-IP': clientIP,
    'CF-Connecting-IP': clientIP,               // Cloudflare
    'Accept-Language': acceptLang,
    'Sec-CH-UA': secChUa,
    'Sec-CH-UA-Mobile': secChUaMobile,
    'Sec-CH-UA-Platform': secChUaPlatform,
    'Referer': 'https://discord.com/channels/@me',
    'Origin': 'https://discord.com',
  };

  // ---- 5. Remove any empty header values ----
  Object.keys(discordHeaders).forEach(key => {
    if (!discordHeaders[key]) delete discordHeaders[key];
  });

  // ---- 6. Call Discord ----
  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: discordHeaders
    });
    const data = await response.json();

    if (!response.ok) {
      // Log full headers and response for debugging (view in Vercel logs)
      console.log('=== DISCORD REJECTED ===');
      console.log('Request headers:', JSON.stringify(discordHeaders, null, 2));
      console.log('Discord response:', JSON.stringify(data, null, 2));
      return res.status(401).json({ error: data.message || 'Invalid token' });
    }

    return res.json({ success: true, user: data });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
