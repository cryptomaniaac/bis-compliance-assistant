'use client';

import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Cpu, Database, FileText, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';

import DepthBackground from '@/components/DepthBackground';
import Reveal from '@/components/Reveal';
import SmoothScroll from '@/components/SmoothScroll';
import SpotlightFeatureCard from '@/components/SpotlightFeatureCard';

const SCHEMES = [
  {
    key: 'isi',
    label: 'ISI Mark',
    badge: 'LAB TEST + FACTORY AUDIT',
    badgeClass: 'seal-stamp',
    icon: '🏭',
    accent: 'var(--accent, #D04A0C)',
    bg: 'linear-gradient(135deg, #FDF0EB, #FEF5F0)',
    border: 'rgba(208,74,12,0.2)',
    borderLeft: 'var(--accent, #D04A0C)',
    title: '1. ISI Mark Certification (Scheme I)',
    body: 'Applies to household electrical appliances (kettles, cookers, irons), helmets, pressure cookers, cement, steel TMT bars, drinking water pipes, and toys. Involves in-house testing facility setup, physical factory inspection by a BIS officer, sample drawing, and NABL verification.',
  },
  {
    key: 'crs',
    label: 'CRS Scheme',
    badge: 'LAB TEST + SELF-DECLARATION',
    badgeClass: 'seal-stamp-blue',
    icon: '💻',
    accent: 'var(--navy-600, #1B2A4A)',
    bg: 'linear-gradient(135deg, #EEF2FA, #F5F7FC)',
    border: 'rgba(27,42,74,0.15)',
    borderLeft: 'var(--navy-600, #1B2A4A)',
    title: '2. Compulsory Registration Scheme (CRS – Scheme II)',
    body: 'Mandatory for electronics, IT equipment, LED bulbs/luminaires, mobile chargers, power banks, solar PV modules, and Lithium-ion batteries. Self-declaration scheme based on NABL laboratory test reports — NO preliminary factory inspection required.',
    note: '💡 CRS Exemption Rule: If a product is CRS-notified (electronics/IT), it is automatically exempt from any overlapping ISI/QCO appliance route — no double certification needed!',
  },
  {
    key: 'scheme-x',
    label: 'Scheme X',
    badge: 'CONFORMITY ASSESSMENT',
    badgeClass: 'seal-stamp-gold',
    icon: '⚙️',
    accent: 'var(--gold-600, #A8732A)',
    bg: 'linear-gradient(135deg, #FDF8F0, #FEFAF5)',
    border: 'rgba(168,115,42,0.2)',
    borderLeft: 'var(--gold-400, #C9943A)',
    title: '3. Scheme X (Omnibus Machinery Regulation)',
    body: 'Applies to specific machinery and industrial equipment (e.g. packing machinery, weaving machinery). Requires product testing and conformity assessment per BIS technical order notifications.',
  },
];

const PILLARS = [
  {
    icon: <FileText size={28} color="#F5D061" />,
    title: 'Zero Hallucination Retrieval',
    body: 'Our RAG pipeline strictly grounds every answer in retrieved database context. If a product isn\'t in our curated dataset, it directs you to official BIS portals.',
  },
  {
    icon: <Database size={28} color="#C9943A" />,
    title: 'Supabase + pgvector',
    body: 'Postgres with native vector similarity search (`pgvector`) for sub-second semantic retrieval over Indian Standards (IS codes), CRS lists, and Quality Control Orders.',
  },
  {
    icon: <Cpu size={28} color="#C1440E" />,
    title: 'Structured Technical Cards',
    body: 'Every output is formatted into structured cards detailing exact standard codes (e.g. `IS 16102`), ISI vs CRS pathways, lab testing parameters, and step-by-step checklists.',
  },
];

export default function AboutPage() {
  const [activeScheme, setActiveScheme] = useState('isi');
  const scheme = SCHEMES.find(s => s.key === activeScheme)!;

  return (
    <SmoothScroll>
      <div style={{ background: 'var(--cream-100, #FAF8F5)', minHeight: 'calc(100vh - 60px)' }}>

        {/* Hero Header */}
        <section className="bg-dark-mesh" style={{
          background: 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #162347 100%)',
          padding: '4rem 2rem 3.5rem',
          textAlign: 'center', color: 'white',
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <DepthBackground />
          <div style={{
            position: 'absolute', top: '-25%', right: '5%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,74,122,0.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <Reveal instantOnMount delay={0} duration={450}>
            <div className="seal-stamp-gold" style={{ fontSize: '0.75rem', padding: '0.28rem 0.8rem', marginBottom: '0.85rem', position: 'relative' }}>
              <Star size={13} />
              SIH26107 TECHNICAL COMPLIANCE ARCHITECTURE
            </div>
          </Reveal>

          <Reveal instantOnMount delay={80} duration={450}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              fontWeight: 800, lineHeight: '1.2',
              letterSpacing: '-0.02em',
              position: 'relative',
            }}>
              Democratizing BIS Regulatory Guidance<br />for Startup Founders
            </h1>
          </Reveal>

          <Reveal instantOnMount delay={160} duration={450}>
            <p style={{
              fontSize: '1rem', color: 'rgba(195,210,230,0.78)',
              maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: '1.65',
              position: 'relative',
            }}>
              BIS Assist translates complex Bureau of Indian Standards regulations and Quality Control Orders into clear, grounded action checklists.
            </p>
          </Reveal>
        </section>

        <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '3.5rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* Architecture Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {PILLARS.map((p, i) => (
              <Reveal key={i} delay={i * 100} duration={500} threshold={0.15}>
                <SpotlightFeatureCard icon={p.icon} title={p.title} desc={p.body} />
              </Reveal>
            ))}
          </div>

          {/* Certification Schemes — Tabbed */}
          <Reveal duration={550} threshold={0.15}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid var(--cream-400, #E2DCD0)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.5rem 1.75rem 0',
              borderBottom: '1px solid var(--cream-300, #EDE7DC)',
            }}>
              <h2 style={{
                fontSize: '1.5rem', fontFamily: 'var(--font-display)',
                fontWeight: 800, color: 'var(--navy-600, #1B2A4A)', marginBottom: '1.1rem',
              }}>
                Understanding BIS Certification Schemes in India
              </h2>

              {/* Tab buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0' }}>
                {SCHEMES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setActiveScheme(s.key)}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px 8px 0 0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      background: activeScheme === s.key ? '#FFFFFF' : 'transparent',
                      color: activeScheme === s.key ? 'var(--navy-600, #1B2A4A)' : '#94A3B8',
                      borderBottom: activeScheme === s.key ? '2px solid var(--navy-600, #1B2A4A)' : '2px solid transparent',
                      transition: 'all 0.18s',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ padding: '1.75rem' }} key={activeScheme}>
              <div style={{
                background: scheme.bg,
                borderLeft: `3px solid ${scheme.borderLeft}`,
                borderRadius: '0 12px 12px 0',
                padding: '1.25rem 1.5rem',
                border: `1px solid ${scheme.border}`,
                borderLeftColor: scheme.borderLeft,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <h4 style={{
                    fontSize: '1.08rem', fontWeight: 800,
                    color: 'var(--navy-600, #1B2A4A)', fontFamily: 'var(--font-display)',
                  }}>
                    {scheme.title}
                  </h4>
                  <span className={scheme.badgeClass} style={{ fontSize: '0.65rem' }}>
                    {scheme.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#3A4562', lineHeight: '1.7' }}>
                  {scheme.body}
                </p>
                {scheme.note && (
                  <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem',
                    background: '#FFFFFF', borderRadius: '8px',
                    border: '1px dashed var(--gold-400, #C9943A)',
                    fontSize: '0.85rem', color: 'var(--navy-600, #1B2A4A)', fontWeight: 600,
                    lineHeight: '1.55',
                  }}>
                    {scheme.note}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal duration={600} threshold={0.2}>
          <div
            className="bg-dark-mesh"
            style={{
              textAlign: 'center', color: 'white',
              padding: '3.5rem 2rem', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', bottom: '-30%', right: '5%',
              width: '280px', height: '280px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(208,74,12,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h3 style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
              fontFamily: 'var(--font-display)', fontWeight: 800, position: 'relative',
            }}>
              Try BIS Compliance Assistant
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(195,210,230,0.75)', maxWidth: '480px', lineHeight: '1.65', position: 'relative' }}>
              Get instant, grounded guidance for your product certification journey.
            </p>
            <Link href="/chat" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', marginTop: '0.25rem', position: 'relative' }}>
              Launch AI Consultant
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>

      <style>{`
        .bg-dark-mesh { background-color:#101B36; background-image: radial-gradient(ellipse 60% 50% at 70% 30%, rgba(45,74,122,0.45) 0%, transparent 60%), radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px); background-size:auto,auto,26px 26px; }
      `}</style>
      </div>
    </SmoothScroll>
  );
}
