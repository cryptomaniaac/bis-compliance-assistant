'use client';

import { useState } from 'react';
import { Camera, CheckCircle2, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

const DEMO_PRODUCTS = [
  {
    name: 'Smart Television',
    category: 'Electronics / MeitY CRS',
    code: 'IS 616:2017',
    type: 'CRS — Lab Testing Only',
    image: '📺',
    tests: ['Electrical Safety Test', 'Insulation Resistance', 'High Voltage Flash'],
  },
  {
    name: 'Electric Kettle',
    category: 'Household Appliance / ISI',
    code: 'IS 302-2-201',
    type: 'ISI Mark — Lab + Factory Audit',
    image: '🫖',
    tests: ['Leakage Current Test', 'Thermal Cutoff Verification', 'Earthing Continuity'],
  },
  {
    name: 'Packaged Water',
    category: 'Food & Beverage',
    code: 'IS 14543',
    type: 'ISI Mark Mandatory',
    image: '💧',
    tests: ['Microbiological Purity', 'Heavy Metal Assay', 'Pesticide Residue Analysis'],
  },
];

export default function ProductScanVisual() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const activeProduct = DEMO_PRODUCTS[selectedIdx];

  const handleScanClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(27,42,74,0.9), rgba(10,17,40,0.95))',
        border: '1px solid rgba(232, 197, 106, 0.25)',
        borderRadius: '20px',
        padding: '2rem 1.75rem',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Laser Scan Sweep Animation */}
      {isScanning && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #D04A0C, #E8C56A, #D04A0C, transparent)',
            boxShadow: '0 0 20px #D04A0C, 0 0 40px #E8C56A',
            zIndex: 10,
            animation: 'laserScan 1.8s ease-in-out infinite',
          }}
        />
      )}

      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(208,74,12,0.2)', border: '1px solid rgba(208,74,12,0.4)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
            <Camera size={18} color="#E8C56A" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(232,197,106,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              INTERACTIVE DEMO
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
              Instant AI Vision Scanner
            </div>
          </div>
        </div>

        {/* Product selector buttons */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {DEMO_PRODUCTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setSelectedIdx(idx); handleScanClick(); }}
              style={{
                background: selectedIdx === idx ? 'rgba(232,197,106,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${selectedIdx === idx ? '#E8C56A' : 'rgba(255,255,255,0.15)'}`,
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {p.image}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scan Viewfinder Display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: '1.5rem',
          background: 'rgba(10,17,40,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1.25rem',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Mock Product Target */}
        <div
          style={{
            height: '110px',
            background: 'radial-gradient(circle, rgba(45,74,122,0.4), rgba(15,29,56,0.8))',
            border: '1.5px dashed rgba(232,197,106,0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.2rem',
            position: 'relative',
            boxShadow: isScanning ? '0 0 25px rgba(208,74,12,0.5)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {activeProduct.image}
          <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '0.65rem', color: '#E8C56A', fontFamily: 'var(--font-mono)' }}>[AI TARGET]</div>
        </div>

        {/* Dynamic Compliance Card Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.55rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}>
              <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '3px' }} />
              MATCHED IS STANDARD
            </span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#E8C56A', fontWeight: 700 }}>
              {activeProduct.code}
            </span>
          </div>

          <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
            {activeProduct.name}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'rgba(195,210,230,0.8)', lineHeight: '1.4' }}>
            <strong>Route:</strong> {activeProduct.type}
          </div>

          {/* Test Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
            {activeProduct.tests.map((t, ti) => (
              <span key={ti} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA within visual */}
      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(195,210,230,0.65)', fontFamily: 'var(--font-mono)' }}>
          Click target product to test scan animation
        </span>
        <button
          onClick={handleScanClick}
          style={{
            background: 'linear-gradient(135deg, #D04A0C, #C9943A)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '0.45rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(208,74,12,0.3)',
          }}
        >
          <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
          Simulate Scan
        </button>
      </div>

      <style>{`
        @keyframes laserScan {
          0% { top: 10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
