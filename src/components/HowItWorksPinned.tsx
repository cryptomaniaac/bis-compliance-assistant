'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquare, Database, CheckCircle2, FileText, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Describe Your Product',
    tag: 'STEP 1 · INPUT & VISION SCAN',
    body: 'Type your product details in plain language or point your camera to scan a physical product. Bharat analyzes shape, markings, and technical function.',
    icon: <MessageSquare size={26} />,
    color: '#F5D061',
    svgType: 'scan',
    details: ['Plain English description support', 'Instant camera photo QR scanner', 'Detects hardware, appliances, toys & steel'],
  },
  {
    num: '02',
    title: 'Get Grounded Answers',
    tag: 'STEP 2 · ZERO-HALLUCINATION RAG',
    body: 'Vector similarity search matches your query against thousands of indexed Indian Standards (IS codes), Quality Control Orders (QCOs), and lab rules.',
    icon: <Database size={26} />,
    color: '#C9943A',
    svgType: 'search',
    details: ['Supabase + pgvector cosine search', 'Grounding against official bis.gov.in', 'Zero fake IS codes or hallucinated rules'],
  },
  {
    num: '03',
    title: 'Follow Action Roadmap',
    tag: 'STEP 3 · COMPLIANCE CHECKLIST',
    body: 'Receive your exact certification route (ISI Mark Scheme I vs CRS Scheme II), mandatory NABL testing parameters, and a step-by-step launch checklist.',
    icon: <CheckCircle2 size={26} />,
    color: '#C1440E',
    svgType: 'roadmap',
    details: ['ISI Mark vs CRS Scheme classification', 'Mandatory NABL lab test list', 'Downloadable technical compliance report'],
  },
];

export default function HowItWorksPinned() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // Desktop Pinning Sequence (>= 768px)
        '(min-width: 768px)': function () {
          if (!pinSectionRef.current || !cardsContainerRef.current) return;

          const cards = cardsContainerRef.current.querySelectorAll<HTMLElement>('.pinned-step-card');
          if (cards.length === 0) return;

          // Initial state: Card 0 visible, Card 1 & 2 hidden
          gsap.set(cards[0], { opacity: 1, autoAlpha: 1, zIndex: 3, pointerEvents: 'all', y: 0, scale: 1 });
          gsap.set(cards[1], { opacity: 0, autoAlpha: 0, zIndex: 1, pointerEvents: 'none', y: 20, scale: 0.97 });
          gsap.set(cards[2], { opacity: 0, autoAlpha: 0, zIndex: 1, pointerEvents: 'none', y: 20, scale: 0.97 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top+=80px',
              end: '+=200%',
              pin: pinSectionRef.current,
              scrub: 0.3, // Tight scrub timeline for immediate, crisp response
              onUpdate: (self) => {
                const progress = self.progress;
                if (progress < 0.4) {
                  setActiveStepIndex(0);
                } else if (progress < 0.75) {
                  setActiveStepIndex(1);
                } else {
                  setActiveStepIndex(2);
                }
              },
            },
          });

          // Crisp, tight step crossfades with zero overlap window
          // Step 1 Out -> Step 2 In
          tl.to(cards[0], { opacity: 0, autoAlpha: 0, zIndex: 1, pointerEvents: 'none', y: -15, scale: 0.97, duration: 0.25 })
            .to(cards[1], { opacity: 1, autoAlpha: 1, zIndex: 3, pointerEvents: 'all', y: 0, scale: 1, duration: 0.25 }, '+=0.05')

          // Step 2 Out -> Step 3 In
            .to(cards[1], { opacity: 0, autoAlpha: 0, zIndex: 1, pointerEvents: 'none', y: -15, scale: 0.97, duration: 0.25 }, '+=0.5')
            .to(cards[2], { opacity: 1, autoAlpha: 1, zIndex: 3, pointerEvents: 'all', y: 0, scale: 1, duration: 0.25 }, '+=0.05');
        },
        // Mobile Fallback (< 768px): Clean stacked layout, no pinning, full visibility
        '(max-width: 767px)': function () {
          if (cardsContainerRef.current) {
            const cards = cardsContainerRef.current.querySelectorAll<HTMLElement>('.pinned-step-card');
            cards.forEach((card) => {
              gsap.set(card, { clearProps: 'all' });
            });
          }
          if (pinSectionRef.current) {
            gsap.set(pinSectionRef.current, { clearProps: 'all' });
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <div
        ref={pinSectionRef}
        style={{
          padding: '4rem 1.5rem',
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '720px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F5D061',
              background: 'rgba(245,208,97,0.08)',
              border: '1px solid rgba(245,208,97,0.22)',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              marginBottom: '1rem',
            }}
          >
            <FileText size={14} />
            <span>HOW BIS ASSIST WORKS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Three steps from query to certified product.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(195, 210, 230, 0.85)', marginTop: '0.85rem', lineHeight: '1.6' }}>
            Transforming dense Indian technical standards into clear action roadmaps for hardware founders and product creators.
          </p>
        </div>

        {/* Persistent Step Indicator Bar (Desktop) */}
        <div
          className="desktop-only-step-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '2.5rem',
            width: '100%',
            maxWidth: '680px',
          }}
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  opacity: isActive ? 1 : 0.4,
                  transition: 'opacity 0.25s ease',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isActive ? 'linear-gradient(135deg, #C9943A, #F5D061)' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#0A1128' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 0 16px rgba(245,208,97,0.5)' : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {step.num}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? '#F5D061' : '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div style={{ width: '40px', height: '2px', background: isActive ? 'rgba(245,208,97,0.6)' : 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Cards Container */}
        <div
          ref={cardsContainerRef}
          style={{
            width: '100%',
            maxWidth: '1080px',
            position: 'relative',
            minHeight: '440px',
          }}
          className="pinned-cards-wrapper"
        >
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="pinned-step-card"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(22, 35, 71, 0.98) 0%, rgba(10, 17, 40, 0.99) 100%)',
                borderRadius: '24px',
                border: '1.5px solid rgba(245,208,97,0.35)',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 20px rgba(201, 148, 58, 0.08) inset',
                padding: '2.5rem',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '2rem',
                alignItems: 'center',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Left Step Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1B2A4A, #0A1128)',
                      border: `1px solid ${step.color}`,
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 16px ${step.color}33`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 800, color: step.color, letterSpacing: '0.08em' }}>
                    {step.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', lineHeight: '1.2' }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: '1.02rem', color: 'rgba(195, 210, 230, 0.9)', lineHeight: '1.65' }}>
                  {step.body}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                  {step.details.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${step.color}22`, border: `1px solid ${step.color}`, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Interactive Visual Illustration Box */}
              <div
                style={{
                  background: 'rgba(10, 17, 40, 0.85)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '260px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative Ambient Glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${step.color}25 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                    pointerEvents: 'none',
                  }}
                />

                {step.svgType === 'scan' && (
                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px dashed #F5D061' }}>
                      <Sparkles size={48} color="#F5D061" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      CAMERA / TEXT PROMPT
                    </div>
                  </div>
                )}

                {step.svgType === 'search' && (
                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(201, 148, 58, 0.15)', border: '1px solid #C9943A' }}>
                        <Cpu size={32} color="#C9943A" />
                      </div>
                      <ArrowRight size={20} color="rgba(255,255,255,0.5)" />
                      <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(201, 148, 58, 0.15)', border: '1px solid #C9943A' }}>
                        <Layers size={32} color="#F5D061" />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#F5D061', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(245,208,97,0.3)' }}>
                      COSINE SIMILARITY: 0.94
                    </div>
                  </div>
                )}

                {step.svgType === 'roadmap' && (
                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(193,68,14,0.4)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>IS 302-2-201</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#065F46', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>MANDATORY ISI</span>
                    </div>
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-mono)' }}>NABL LAB TESTING</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C9943A', background: 'rgba(201,148,58,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>4 TESTS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .pinned-step-card {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
        }
        @media (max-width: 767px) {
          .pinned-cards-wrapper {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
            min-height: auto !important;
          }
          .pinned-step-card {
            position: relative !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: all !important;
            transform: none !important;
            grid-template-columns: 1fr !important;
          }
          .desktop-only-step-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
