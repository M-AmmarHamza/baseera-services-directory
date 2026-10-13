import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Baseera Services Directory';
  const subtitle = searchParams.get('subtitle') || 'Verified Specialists & Technicians';
  const rating = searchParams.get('rating') || '4.9';
  const reviews = searchParams.get('reviews') || '100+';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#004e35',
          backgroundImage: 'linear-gradient(135deg, #006948 0%, #003624 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'white',
              color: '#006948',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              fontWeight: 'bold',
            }}
          >
            ب
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
              Baseera بصیرہ
            </span>
            <span style={{ fontSize: '16px', color: '#a7f3d0' }}>
              Direct Local Services Directory
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '20px',
              color: '#6ee7b7',
              alignSelf: 'flex-start',
            }}
          >
            ★ {rating} ({reviews} Verified Reviews)
          </div>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '24px', color: '#d1fae5', margin: 0 }}>
            {subtitle} • Zero Broker Commission • Direct WhatsApp
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '24px',
            fontSize: '18px',
            color: '#a7f3d0',
          }}
        >
          <span>baseera.pk</span>
          <span>Verified Local Craftsmen & Technicians</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
