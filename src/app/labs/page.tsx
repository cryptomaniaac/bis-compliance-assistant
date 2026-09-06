'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, ShieldCheck, CheckCircle2, FlaskConical } from 'lucide-react';
import DepthBackground from '@/components/DepthBackground';
import Reveal from '@/components/Reveal';
import SmoothScroll from '@/components/SmoothScroll';
import { BIS_RECOGNIZED_LABS } from '@/lib/labsData';

const CATEGORIES = [
  'All',
  'Electrical & Appliances',
  'LED & Lighting',
  'Toys',
  'Food & Water',
  'Cement & Steel',
  'Helmets & Fire Safety',
  'Batteries & IT',
];

export default function TestingLabsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredLabs = useMemo(() => {
    return BIS_RECOGNIZED_LABS.filter((lab) => {
      const matchesCategory = selectedCategory === 'All' || lab.categories.includes(selectedCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        lab.name.toLowerCase().includes(q) ||
        lab.city.toLowerCase().includes(q) ||
        lab.state.toLowerCase().includes(q) ||
        lab.categories.some((c) => c.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <SmoothScroll>
      <div style={{ background: 'var(--cream-100, #FAF8F5)', minHeight: 'calc(100vh - 60px)' }}>
        {/* Dark Depth Header */}
        <div
          className="bg-dark-mesh"
          style={{
            background: 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #162347 100%)',
            padding: '3.5rem 2rem 5.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <DepthBackground />

          <Reveal instantOnMount delay={0} duration={450}>
            <div
              className="seal-stamp-gold"
              style={{ fontSize: '0.78rem', padding: '0.32rem 0.9rem', marginBottom: '0.9rem', position: 'relative', zIndex: 2 }}
            >
              <FlaskConical size={14} />
              <span>NABL ACCREDITED &amp; BIS RECOGNIZED LABS</span>
            </div>
          </Reveal>

          <Reveal instantOnMount delay={80} duration={450}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                position: 'relative',
                zIndex: 2,
              }}
            >
              BIS-Recognized Testing Lab Directory
            </h1>
          </Reveal>

          <Reveal instantOnMount delay={160} duration={450}>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'rgba(195,210,230,0.85)',
                marginTop: '0.75rem',
                position: 'relative',
                zIndex: 2,
                maxWidth: '640px',
                margin: '0.75rem auto 0',
              }}
            >
              Locate official NABL accredited testing laboratories across India authorized for sample testing under BIS ISI Mark and CRS schemes.
            </p>
          </Reveal>
        </div>

        {/* Main Content Layout */}
        <div style={{ maxWidth: '1240px', margin: '-2.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          {/* Filter Bar */}
          <Reveal instantOnMount delay={150} duration={500}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.25rem 1.75rem',
                border: '1.5px solid var(--cream-400, #E2DCD0)',
                boxShadow: '0 16px 40px rgba(10,17,40,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <Search size={17} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lab by name, city (Delhi, Mumbai, Bengaluru...), or product..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: '1px solid var(--cream-400, #E2DCD0)',
                      fontSize: '0.92rem',
                      outline: 'none',
                      background: '#FAFBFD',
                    }}
                  />
                </div>

                <a
                  href="https://www.services.bis.gov.in/php/BIS_2.0/bisrepo/lab/lab_list"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent, #D04A0C)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--accent-light, #FDF0EB)',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(208,74,12,0.2)',
                  }}
                >
                  Official BIS Lab Portal Search <ExternalLink size={13} />
                </a>
              </div>

              {/* Category Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>
                  Product Category:
                </span>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: isSelected ? '1px solid #1B2A4A' : '1px solid #E2DCD0',
                        background: isSelected ? '#1B2A4A' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Grid of Testing Lab Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredLabs.map((lab, index) => (
              <Reveal key={lab.id} instantOnMount delay={index * 50} duration={400}>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--cream-400, #E2DCD0)',
                    boxShadow: '0 8px 24px rgba(10,17,40,0.04)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    height: '100%',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(10,17,40,0.09)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(27,42,74,0.3)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(10,17,40,0.04)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-400, #E2DCD0)';
                  }}
                >
                  <div>
                    {/* Header: Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#10B981',
                          background: 'rgba(16,185,129,0.12)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(16,185,129,0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CheckCircle2 size={11} /> NABL Accredited
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#C9943A',
                          background: 'rgba(201,148,58,0.12)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(201,148,58,0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <ShieldCheck size={11} /> BIS Recognized
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1B2A4A', lineHeight: '1.3' }}>
                      {lab.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D04A0C', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.4rem' }}>
                      <MapPin size={14} />
                      <span>{lab.city}, {lab.state}</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.4rem', lineHeight: '1.5' }}>
                      {lab.address}
                    </p>

                    {/* Scope Tags */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        Accredited Product Scope:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {lab.categories.map((c) => (
                          <span
                            key={c}
                            style={{
                              fontSize: '0.72rem',
                              color: '#1B2A4A',
                              background: '#F1F5F9',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              fontWeight: 600,
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Contact Info */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} color="#64748B" />
                      <span>{lab.phone}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={13} color="#64748B" />
                      <span>{lab.email}</span>
                    </div>
                    {lab.website && (
                      <a
                        href={lab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#1B2A4A', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}
                      >
                        Visit Website <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {filteredLabs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2DCD0' }}>
              <FlaskConical size={36} color="#94A3B8" />
              <h3 style={{ fontSize: '1.2rem', color: '#1B2A4A', marginTop: '0.75rem', fontWeight: 700 }}>
                No matching testing labs found
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.25rem' }}>
                Try searching for a different city or clearing category filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </SmoothScroll>
  );
}
