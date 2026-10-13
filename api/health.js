export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'Baseera Karachi API',
    version: '2.0.0',
    region: 'Karachi, PK',
    timestamp: new Date().toISOString(),
    features: {
      auth: 'Google OAuth via Supabase',
      database: 'PostgreSQL / Supabase',
      leadTracking: 'Active',
      reviews: 'Active'
    }
  });
}
