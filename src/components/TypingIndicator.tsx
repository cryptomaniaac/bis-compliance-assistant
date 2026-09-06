'use client';

import { ShieldCheck, Cpu } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        margin: '0.75rem 0',
        alignSelf: 'flex-start',
        maxWidth: '90%'
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: '#1B2A4A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <ShieldCheck size={20} />
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2DCD0',
          borderRadius: '12px 12px 12px 2px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 2px 10px rgba(27, 42, 74, 0.06)'
        }}
      >
        <Cpu size={16} className="dot-1" style={{ color: '#C1440E' }} />
        <span style={{ fontSize: '0.88rem', color: '#1B2A4A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          Analyzing product against BIS standards & rules...
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.4rem' }}>
          <div className="dot-1" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C1440E' }} />
          <div className="dot-2" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C1440E' }} />
          <div className="dot-3" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C1440E' }} />
        </div>
      </div>
    </div>
  );
}
