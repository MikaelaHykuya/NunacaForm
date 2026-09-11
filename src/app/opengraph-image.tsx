import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Nunaca Form Engine — Formulir Interaktif dari Nunaca Group Indonesia';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: 'rgba(255,204,0,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -160,
            bottom: -160,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: 'rgba(255,204,0,0.06)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '72px 80px 0' }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: '#FFCC00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#050505', fontSize: 60, fontWeight: 900 }}>N</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 8, color: '#ffffff' }}>
              NUNACA GROUP
            </div>
            <div style={{ fontSize: 16, letterSpacing: 10, color: '#FFCC00', fontWeight: 600 }}>
              INDONESIA
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 80px',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              alignItems: 'baseline',
              fontSize: 88,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: -2,
            }}
          >
            <span>NUNACA FORM </span>
            <span style={{ color: '#FFCC00' }}>ENGINE</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: 2,
              marginTop: 16,
            }}
          >
            Formulir interaktif satu pertanyaan per layar  •  logic jumps  •  analitik terpadu.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px 64px',
          }}
        >
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
            nunacagroupindonesia.com
          </div>
          <div style={{ fontSize: 16, letterSpacing: 3, color: '#FFCC00' }}>
            BARBERSHOP • BEAUTY • SPA • COFFEE
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}