'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanRootPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `scan_${Date.now()}`;
    router.replace(`/scan/${sessionId}`);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1128', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #D04A0C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Opening Product Scanner...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
