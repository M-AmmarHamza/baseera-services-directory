// Vercel Edge Middleware: Geo-Routing & IP Detection
// Automatically detects visitor location (e.g. Karachi, PK) and sets localized silo context

export const config = {
  matcher: ['/api/geo']
};

export default function middleware(request) {
  const url = new URL(request.url);
  const countryHeader = request.headers.get('x-vercel-ip-country') || 'PK';
  const cityHeader = request.headers.get('x-vercel-ip-city') || 'Karachi';
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

  const country = countryHeader.toLowerCase();
  const city = cityHeader.toLowerCase();

  return new Response(JSON.stringify({
    success: true,
    ip: clientIp.split(',')[0].trim(),
    country: countryHeader,
    city: cityHeader,
    siloUrl: `/en/${country}/${city}`,
    isKarachi: city.includes('karachi') || country === 'pk',
    message: 'Location auto-detected via Vercel Edge Middleware'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'x-baseera-detected-country': country,
      'x-baseera-detected-city': city,
      'Set-Cookie': `baseera_geo_city=${encodeURIComponent(cityHeader)}; Path=/; SameSite=Lax`
    }
  });
}
