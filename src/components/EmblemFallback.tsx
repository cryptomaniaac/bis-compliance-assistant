'use client';

export default function EmblemFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Ambient Radial Lighting Glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(243,211,138,0.25) 0%, rgba(208,74,12,0.12) 55%, transparent 75%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />

      {/* Instant 3D Spinning Emblem SVG */}
      <div
        style={{
          width: '280px',
          height: '280px',
          position: 'relative',
          zIndex: 2,
          animation: 'emblemSpin3D 16s linear infinite',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.5))',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGradFallback" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3d38a" />
              <stop offset="50%" stopColor="#d4a24c" />
              <stop offset="100%" stopColor="#a67326" />
            </linearGradient>
            <linearGradient id="navyGradFallback" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c2340" />
              <stop offset="100%" stopColor="#0e1226" />
            </linearGradient>
            <linearGradient id="maroonGradFallback" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a12a2a" />
              <stop offset="100%" stopColor="#6e1717" />
            </linearGradient>
            <path id="topArcFb" d="M 41.0,200.0 A 163,163 0 0 1 359.0,200.0" />
            <path id="bottomArcFb" d="M 41.0,200.0 A 163,163 0 0 0 359.0,200.0" />
          </defs>
          <circle cx="200" cy="200" r="190" fill="url(#navyGradFallback)" stroke="url(#goldGradFallback)" strokeWidth="4" />
          <circle cx="200" cy="200" r="176" fill="none" stroke="url(#goldGradFallback)" strokeWidth="2" opacity="0.6" />

          {/* Medallion Notch Ring */}
          <g fill="url(#goldGradFallback)" opacity="0.85" transform="translate(200,200)">
            {Array.from({ length: 40 }).map((_, i) => (
              <rect key={i} x="-1.2" y="-190" width="2.4" height="8" transform={`rotate(${i * 9})`} />
            ))}
          </g>

          <text fontFamily="Georgia, 'Times New Roman', serif" fontSize="19" fontWeight="700" letterSpacing="4.5" fill="url(#goldGradFallback)">
            <textPath href="#topArcFb" startOffset="50%" textAnchor="middle">BIS ASSIST</textPath>
          </text>
          <text fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" fontWeight="600" letterSpacing="2" fill="#e8d29a">
            <textPath href="#bottomArcFb" startOffset="50%" textAnchor="middle">OFFICIAL STANDARDS PORTAL</textPath>
          </text>
          <circle cx="41" cy="200" r="2.5" fill="url(#goldGradFallback)" />
          <circle cx="359" cy="200" r="2.5" fill="url(#goldGradFallback)" />
          <circle cx="200" cy="200" r="150" fill="#161b34" stroke="url(#goldGradFallback)" strokeWidth="1.5" />

          {/* Laurel Wreath */}
          <g fill="none" stroke="url(#goldGradFallback)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 112,266 C 98,240 96,205 105,172 C 112,150 106,138 98,120" />
            <g strokeWidth="2">
              <path d="M 108,248 C 96,245 87,249 81,258" />
              <path d="M 105,228 C 93,226 83,230 77,239" />
              <path d="M 106,208 C 94,206 84,210 78,219" />
              <path d="M 108,188 C 97,186 88,190 82,198" />
            </g>
            <path d="M 288,266 C 302,240 304,205 295,172 C 288,150 294,138 302,120" />
            <g strokeWidth="2">
              <path d="M 292,248 C 304,245 313,249 319,258" />
              <path d="M 295,228 C 307,226 317,230 323,239" />
              <path d="M 294,208 C 306,206 316,210 322,219" />
              <path d="M 292,188 C 303,186 312,190 318,198" />
            </g>
          </g>

          {/* Shield Center Emblem */}
          <g transform="translate(200,170)">
            <path d="M 0,-46 L 36,-32 C 36,-2 31,28 0,48 C -31,28 -36,-2 -36,-32 Z" fill="url(#maroonGradFallback)" stroke="url(#goldGradFallback)" strokeWidth="3" />
            <path d="M 0,-36 L 28,-25 C 28,-2 24,20 0,38 C -24,20 -28,-2 -28,-25 Z" fill="none" stroke="url(#goldGradFallback)" strokeWidth="1" opacity="0.7" />
            <path d="M -16,-1 L -5,11 L 19,-17" fill="none" stroke="url(#goldGradFallback)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g transform="translate(200,246)" fill="url(#goldGradFallback)">
            <path d="M0,-9 L2.4,-2.8 L9,-2.8 L3.7,1.3 L5.6,7.7 L0,3.8 L-5.6,7.7 L-3.7,1.3 L-9,-2.8 L-2.4,-2.8 Z" />
          </g>
        </svg>
      </div>

      <style jsx global>{`
        @keyframes emblemSpin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
