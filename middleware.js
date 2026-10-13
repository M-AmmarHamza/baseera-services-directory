// Vercel Edge Middleware: Geo-Routing & IP Detection
// Automatically detects visitor location (e.g. Karachi, PK) and sets localized silo context

export const config = {
  matcher: ['/', '/index.html', '/api/geo']
};

export default function middleware(request) {
  // Read Vercel Geo IP headers
  const countryHeader = request.headers.get('x-vercel-ip-country') || 'PK';
  const cityHeader = request.headers.get('x-vercel-ip-city') || 'Karachi';
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  const country = countryHeader.toLowerCase();
  const city = cityHeader.toLowerCase();

  // If request is for geo lookup endpoint
  if (request.nextUrl?.pathname === '/api/geo') {
    return new Response(JSON.stringify({
      ip: clientIp,
      country: countryHeader,
      city: cityHeader,
      defaultRoute: `/${country}/${city}`,
      isKarachi: city.includes('karachi') || country === 'pk'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  // Response with Geo context cookies for seamless frontend auto-selection
  const response = new Response(null, {
    status: 200,
    headers: {
      'x-baseera-detected-country': country,
      'x-baseera-detected-city': city,
      'Set-Cookie': `baseera_geo_city=${encodeURIComponent(cityHeader)}; Path=/; SameSite=Lax`
    }
  });

  return response;
}
