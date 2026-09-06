import type { ReactNode } from 'react';

// Minimal layout for /scan/[sessionId] — no Navbar, no shared chrome
// Optimised for mobile browsers
export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F4EC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {children}
      </div>
    </div>
  );
}
