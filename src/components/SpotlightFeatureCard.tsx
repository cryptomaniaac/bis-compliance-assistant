'use client';

import { useState, useRef, ReactNode } from 'react';

interface SpotlightFeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

export default function SpotlightFeatureCard({ icon, title, desc }: SpotlightFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Subtle 3D Tilt
    const rotX = (- (y - rect.height / 2) / rect.height) * 8;
    const rotY = ((x - rect.width / 2) / rect.width) * 8;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -200, y: -200 });
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(22, 35, 71, 0.95) 0%, rgba(10, 17, 40, 0.98) 100%)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        border: `1.5px solid ${isHovered ? '#F5D061' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: isHovered
          ? '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 208, 97, 0.15) inset'
          : '0 16px 40px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        overflow: 'hidden',
        willChange: 'transform',
      }}
    >
      {/* Cursor-Reactive Spotlight Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 208, 97, 0.18) 0%, transparent 80%)`,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
          zIndex: 1,
        }}
      />

      {/* Content Layer */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isHovered ? '0 0 16px rgba(245, 208, 97, 0.3)' : 'none',
            transition: 'box-shadow 0.25s ease',
          }}
        >
          {icon}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.96rem', color: 'rgba(195, 210, 230, 0.85)', lineHeight: '1.65' }}>
          {desc}
        </p>
      </div>
    </div>
  );
}
