'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ShieldCheck, ExternalLink, ChevronRight, AlertCircle, X, Filter, Sparkles, Layers } from 'lucide-react';
import DepthBackground from '@/components/DepthBackground';
import Reveal from '@/components/Reveal';
import SmoothScroll from '@/components/SmoothScroll';
import CostTimelineCard from '@/components/CostTimelineCard';

interface StandardItem {
  id?: string;
  standard_code: string;
  title: string;
  product_category: string;
  description: string;
  certification_type: string;
  testing_requirements: string;
  source_url: string;
}

const CATEGORIES = [
  { label: 'All', emoji: '🗂' },
  { label: 'Electrical & Appliances', emoji: '⚡' },
  { label: 'Toys', emoji: '🧸' },
  { label: 'Food & Water', emoji: '💧' },
  { label: 'Cement & Steel', emoji: '🏗' },
  { label: 'Helmets & Fire Safety', emoji: '🪖' },
  { label: 'Batteries & IT', emoji: '🔋' },
];

export default function BrowsePage() {
  const [standards, setStandards] = useState<StandardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState<StandardItem | null>(null);

  useEffect(() => { fetchStandards(searchQuery); }, [searchQuery]);

  const fetchStandards = async (q: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/standards/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.standards) {
        // Strict deduplication by standard_code
        const uniqueMap = new Map();
        data.standards.forEach((st: StandardItem) => {
          const k = st.standard_code ? st.standard_code.trim().toLowerCase() : '';
          if (k && !uniqueMap.has(k)) uniqueMap.set(k, st);
        });
        setStandards(Array.from(uniqueMap.values()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStandards = standards.filter(st => {
    if (selectedCategory === 'All') return true;
    const c = st.product_category.toLowerCase();
    if (selectedCategory === 'Electrical & Appliances') return c.includes('electric') || c.includes('led') || c.includes('cooker') || c.includes('appliances');
    if (selectedCategory === 'Toys') return c.includes('toys');
    if (selectedCategory === 'Food & Water') return c.includes('food') || c.includes('water') || c.includes('drinking');
    if (selectedCategory === 'Cement & Steel') return c.includes('cement') || c.includes('steel') || c.includes('bricks');
    if (selectedCategory === 'Helmets & Fire Safety') return c.includes('helmets') || c.includes('fire') || c.includes('motorcycle');
    if (selectedCategory === 'Batteries & IT') return c.includes('battery') || c.includes('batteries') || c.includes('it') || c.includes('video') || c.includes('audio');
    return true;
  });

  return (
    <SmoothScroll>
      <div style={{ background: 'var(--cream-100, #FAF8F5)', minHeight: 'calc(100vh - 60px)' }}>
        {/* Dark Depth Header */}
        <div className="bg-dark-mesh" style={{
          background: 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #162347 100%)',
          padding: '3.5rem 2rem 5.5rem',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <DepthBackground />

          <Reveal instantOnMount delay={0} duration={450}>
            <div
              className="seal-stamp-gold"
              style={{ fontSize: '0.78rem', padding: '0.32rem 0.9rem', marginBottom: '0.9rem', position: 'relative', zIndex: 2 }}
            >
              <BookOpen size={14} />
              <span>INDIAN STANDARDS DATABASE INDEX</span>
            </div>
          </Reveal>

          <Reveal instantOnMount delay={80} duration={450}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              position: 'relative', zIndex: 2,
            }}>
              Browse Indian Standards (IS Codes)
            </h1>
          </Reveal>

          <Reveal instantOnMount delay={160} duration={450}>
            <p style={{
              fontSize: '1.05rem', color: 'rgba(195,210,230,0.85)',
              marginTop: '0.75rem', position: 'relative', zIndex: 2,
            }}>
              Search technical specifications, mandatory quality control orders, and lab testing parameters.
            </p>
          </Reveal>
        </div>

        {/* Main Content Layout — Sidebar Filter + Featured Grid */}
        <div style={{ maxWidth: '1280px', margin: '-2.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* LEFT SIDEBAR — Sticky Search & Category Filter */}
            <Reveal instantOnMount delay={150} duration={500}>
              <div
                style={{
                  position: 'sticky',
                  top: '80px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  border: '1.5px solid var(--cream-400, #E2DCD0)',
                  boxShadow: '0 16px 40px rgba(10,17,40,0.08)',
                  display: 'flex', flexDirection: 'column', gap: '1.25rem',
                }}
              >
                {/* Search Input */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Search size={14} /> Search Standards
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="IS code or keyword..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.2rem',
                        borderRadius: '10px',
                        border: '1.5px solid var(--cream-400, #E2DCD0)',
                        fontSize: '0.88rem', color: '#1A1F2E',
                        outline: 'none', fontFamily: 'inherit',
                        background: 'var(--cream-100, #FAF8F5)',
                      }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>

                {/* Category Sidebar List */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Filter size={14} /> Categories ({filteredStandards.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {CATEGORIES.map((cat, idx) => {
                      const active = selectedCategory === cat.label;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedCategory(cat.label)}
                          style={{
                            background: active ? 'var(--navy-600, #1B2A4A)' : 'transparent',
                            color: active ? '#FFFFFF' : 'var(--navy-600, #1B2A4A)',
                            border: 'none',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '10px',
                            fontWeight: active ? 700 : 500,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{cat.emoji}</span>
                            {cat.label}
                          </span>
                          {active && <span style={{ fontSize: '0.72rem', background: '#D04A0C', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '8px', fontWeight: 800 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Reveal>

          {/* RIGHT MAIN CONTENT — Featured Standards & Grid */}
          <div>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', height: '200px', border: '1px solid var(--cream-400)' }} className="shimmer" />
                ))}
              </div>
            ) : filteredStandards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--cream-400)' }}>
                <AlertCircle size={36} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.1rem', color: 'var(--navy-600)', fontWeight: 800 }}>
                  No matching standards found for "{searchQuery}"
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.35rem' }}>
                  Try clearing search keywords or filters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Header count */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy-600)' }}>
                    Showing <span style={{ color: '#D04A0C' }}>{filteredStandards.length}</span> verified BIS Standards
                  </div>
                </div>

                {/* Standards Grid with Scroll Reveals */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.35rem' }}>
                  {filteredStandards.map((st, idx) => {
                    const isCRS = st.certification_type.includes('CRS');
                    return (
                      <Reveal key={idx} delay={(idx % 6) * 60} duration={450} threshold={0.1}>
                        <div
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1.5px solid var(--cream-400, #E2DCD0)',
                            padding: '1.6rem',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.1rem',
                            boxShadow: '0 8px 24px rgba(10,17,40,0.05)',
                            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s, border-color 0.22s',
                            cursor: 'pointer',
                            position: 'relative',
                            height: '100%',
                          }}
                          onClick={() => setSelectedStandard(st)}
                          onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 48px rgba(10,17,40,0.12)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy-600, #1B2A4A)';
                          }}
                          onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(10,17,40,0.05)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-400, #E2DCD0)';
                          }}
                        >
                          <div>
                            {/* Standard Code & Stamp Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', gap: '0.4rem' }}>
                              <span className="standard-code-badge" style={{ fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}>
                                {st.standard_code}
                              </span>

                              {/* Authentic Rotated Stamp Badge */}
                              <span
                                className={isCRS ? 'seal-stamp-blue' : 'seal-stamp-gold'}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.22rem 0.65rem',
                                  transform: 'rotate(-2.5deg)',
                                  boxShadow: isCRS ? '0 2px 10px rgba(27,42,74,0.2)' : '0 2px 10px rgba(201,148,58,0.25)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <span>{isCRS ? '⚡' : '🛡️'}</span>
                                <span>{isCRS ? 'CRS SCHEME' : 'ISI MARK'}</span>
                              </span>
                            </div>

                            <h3 style={{
                              fontSize: '1.08rem', fontFamily: 'var(--font-display)',
                              fontWeight: 800, color: 'var(--navy-600, #1B2A4A)', lineHeight: '1.35',
                            }}>
                              {st.title}
                            </h3>
                            <p style={{
                              fontSize: '0.78rem', color: 'var(--accent, #D04A0C)',
                              fontWeight: 700, marginTop: '0.35rem',
                              fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              {st.product_category}
                            </p>
                            <p style={{
                              fontSize: '0.86rem', color: '#64748B', marginTop: '0.6rem',
                              lineHeight: '1.6', display: '-webkit-box',
                              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {st.description}
                            </p>
                          </div>

                          <div style={{
                            borderTop: '1px solid var(--cream-300, #EDE7DC)',
                            paddingTop: '0.9rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}>
                            <span style={{
                              fontSize: '0.8rem', color: '#94A3B8',
                              fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.03em',
                            }}>
                              View rules & tests
                            </span>
                            <Link
                              href={`/chat?prompt=${encodeURIComponent(`What are the testing requirements and compliance steps for ${st.standard_code} (${st.product_category})?`)}`}
                              className="btn-primary"
                              style={{ padding: '0.42rem 0.95rem', fontSize: '0.8rem', borderRadius: '8px' }}
                              onClick={e => e.stopPropagation()}
                            >
                              Ask AI
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedStandard && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,17,40,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedStandard(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
              border: '1.5px solid var(--cream-400, #E2DCD0)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: 'var(--navy-600, #1B2A4A)', color: '#FFFFFF',
              padding: '1.5rem 1.75rem',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div>
                <span className="standard-code-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }}>
                  {selectedStandard.standard_code}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '0.5rem', lineHeight: '1.3' }}>
                  {selectedStandard.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: 'none', color: '#FFFFFF',
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent, #D04A0C)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Product Category
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy-600, #1B2A4A)', marginTop: '0.2rem' }}>
                  {selectedStandard.product_category}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Certification Type
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--navy-600, #1B2A4A)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {selectedStandard.certification_type}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description & Scope
                </div>
                <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', marginTop: '0.25rem' }}>
                  {selectedStandard.description}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Testing Requirements
                </div>
                <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', marginTop: '0.25rem' }}>
                  {selectedStandard.testing_requirements}
                </div>
              </div>

              {/* Cost & Timeline Estimator Card */}
              <CostTimelineCard standardCode={selectedStandard.standard_code} />
            </div>

            <div style={{
              background: 'var(--cream-100, #FAF8F5)', borderTop: '1px solid var(--cream-400, #E2DCD0)',
              padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <a
                href={selectedStandard.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: '#64748B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
              >
                Official BIS Source
                <ExternalLink size={13} />
              </a>
              <Link
                href={`/chat?prompt=${encodeURIComponent(`What are the compliance steps for ${selectedStandard.standard_code} (${selectedStandard.product_category})?`)}`}
                className="btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}
                onClick={() => setSelectedStandard(null)}
              >
                Consult Bharat AI
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </SmoothScroll>
  );
}
