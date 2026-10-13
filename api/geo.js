// Vercel Serverless Function: /api/geo
// Geo-IP detection fallback endpoint

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const country = req.headers['x-vercel-ip-country'] || 'PK';
  const city = req.headers['x-vercel-ip-city'] || 'Karachi';
  const region = req.headers['x-vercel-ip-country-region'] || 'SD';
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  return res.status(200).json({
    success: true,
    ip: clientIp.split(',')[0].trim(),
    country,
    city,
    region,
    siloUrl: `/en/${country.toLowerCase()}/${city.toLowerCase()}`,
    isKarachi: city.toLowerCase().includes('karachi') || country.toUpperCase() === 'PK',
    message: 'Location auto-detected via Vercel Edge'
  });
}
