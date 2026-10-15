import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mintfolio — personal mutual fund portfolio tracker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Load Space Grotesk Bold from Google Fonts
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then((r) => r.text());

    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (fontUrl) fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());
  } catch {
    // fall back to system sans-serif
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          position: 'relative',
        }}
      >
        {/* Radial green glow */}
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.12) 0%, transparent 65%)',
            top: '115px',
            left: '250px',
          }}
        />

        {/* Bottom edge accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(to right, transparent, #4ade80, transparent)',
            opacity: 0.5,
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '80px',
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '-3px',
            marginBottom: '28px',
            fontFamily: fontData ? 'Space Grotesk' : 'sans-serif',
          }}
        >
          <span style={{ color: '#4ade80' }}>●</span>
          <span>mintfolio</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '48px',
            height: '3px',
            background: '#4ade80',
            borderRadius: '999px',
            opacity: 0.7,
            marginBottom: '28px',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '30px',
            fontWeight: 400,
            color: '#a1a1aa',
            letterSpacing: '0.01em',
            fontFamily: 'sans-serif',
          }}
        >
          <span>Track your mutual funds.&nbsp;</span>
          <span style={{ color: '#4ade80', fontWeight: 500 }}>Daily.</span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? { fonts: [{ name: 'Space Grotesk', data: fontData, style: 'normal', weight: 700 }] }
        : {}),
    },
  );
}
