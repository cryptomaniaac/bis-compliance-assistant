'use client';

import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { StructuredBISResponse } from '@/lib/llm';
import { useState } from 'react';
import DownloadPdfButton from './DownloadPdfButton';
import CostTimelineCard from './CostTimelineCard';

interface ResultCardProps {
  data: StructuredBISResponse;
}

export default function ResultCard({ data }: ResultCardProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid var(--cream-400, #E2DCD0)',
        boxShadow: '0 20px 48px rgba(10,17,40,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Animated gradient top stripe */}
      <div className="cert-header-stripe" />

      {/* Certificate Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #162347 100%)',
        padding: '1.4rem 1.75rem 1.25rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '1rem', flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Header ambient glow */}
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,148,58,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9943A, #A8732A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(168,115,42,0.35)',
            flexShrink: 0,
          }}>
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              color: 'rgba(201,148,58,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '0.2rem',
            }}>
              BIS TECHNICAL ANALYSIS
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF',
            }}>
              Compliance Verification Report
            </div>
          </div>
        </div>

        {/* Official stamp */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: data.found_in_context ? 'rgba(16,185,129,0.15)' : 'rgba(208,74,12,0.15)',
          border: `1px solid ${data.found_in_context ? 'rgba(16,185,129,0.35)' : 'rgba(208,74,12,0.35)'}`,
          borderRadius: '20px',
          padding: '0.3rem 0.8rem',
          flexShrink: 0,
        }}>
          {data.found_in_context
            ? <CheckCircle2 size={13} color="#10B981" />
            : <AlertCircle size={13} color="#D04A0C" />}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
            color: data.found_in_context ? '#10B981' : '#D04A0C',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {data.found_in_context ? 'OFFICIAL MATCH' : 'VERIFY WITH BIS'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Product Banner */}
        {data.identified_product && (
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FA, #F5F7FC)',
            border: '1px solid rgba(27,42,74,0.15)',
            borderLeft: '3px solid var(--navy-600, #1B2A4A)',
            borderRadius: '10px',
            padding: '0.85rem 1.1rem',
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            animation: 'fadeIn 0.4s ease-out',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🔍</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                color: 'var(--accent, #D04A0C)', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '0.2rem',
              }}>
                VERIFIED PRODUCT TYPE
              </div>
              <div style={{
                fontSize: '1rem', fontWeight: 800, color: 'var(--navy-600, #1B2A4A)',
                fontFamily: 'var(--font-display)',
              }}>
                {data.identified_product}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <p style={{
          fontSize: '0.94rem', color: '#3A4562', lineHeight: '1.7', fontWeight: 400,
          borderBottom: '1px solid var(--cream-400, #E2DCD0)',
          paddingBottom: '1.25rem',
        }}>
          {data.summary}
        </p>

        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <div style={{
            background: 'var(--cream-100, #FAF8F5)',
            borderRadius: '10px',
            padding: '0.85rem 1.1rem',
            border: '1px solid var(--cream-400, #E2DCD0)',
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--navy-600, #1B2A4A)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
            }}>
              CITED SOURCES:
            </span>
            {data.sources.map((s, i) => (
              <a
                key={i} href={s} target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.78rem', color: 'var(--accent, #D04A0C)',
                  fontFamily: 'var(--font-mono)', textDecoration: 'none', fontWeight: 600,
                  padding: '0.2rem 0.55rem', borderRadius: '4px',
                  background: 'var(--accent-light, #FDF0EB)',
                  border: '1px solid rgba(208,74,12,0.2)',
                  transition: 'all 0.18s',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,12,0.15)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-light, #FDF0EB)'; }}
              >
                <ExternalLink size={11} />
                {s.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
              </a>
            ))}
          </div>
        )}

        {/* Applicable Standards */}
        {data.applicable_standards && data.applicable_standards.length > 0 ? (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--navy-600, #1B2A4A)', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '0.75rem',
            }}>
              APPLICABLE INDIAN STANDARDS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.applicable_standards.map((std, i) => (
                <div
                  key={i}
                  style={{
                    background: '#FAFBFD',
                    border: '1px solid var(--cream-400, #E2DCD0)',
                    borderRadius: '10px',
                    padding: '1rem 1.1rem',
                    transition: 'all 0.2s',
                    cursor: 'default',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(27,42,74,0.3)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(10,17,40,0.06)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-400, #E2DCD0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span className="standard-code-badge" style={{ flexShrink: 0, fontSize: '0.72rem' }}>
                      {std.code}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-600, #1B2A4A)', lineHeight: '1.3' }}>
                        {std.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.35rem', lineHeight: '1.5' }}>
                        {std.why}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !data.found_in_context && (
          /* Not-found fallback — helpful portal links */
          <div style={{
            background: 'linear-gradient(135deg, #FFFBEB, #FEF9EC)',
            border: '1px solid rgba(201,148,58,0.3)',
            borderLeft: '3px solid #C9943A',
            borderRadius: '10px',
            padding: '1.1rem 1.25rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              color: '#A8732A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem',
            }}>
              NOT IN CURATED DATABASE — NEXT STEPS
            </div>
            <p style={{ fontSize: '0.88rem', color: '#3A4562', lineHeight: '1.65', marginBottom: '0.85rem' }}>
              This product isn't in our initial curated database (~18 common standards), but BIS may still have a mandatory standard. Search directly on these official portals:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'BIS Official Portal', url: 'https://www.bis.gov.in', desc: 'Browse all IS standards by category' },
                { label: 'Manakonline — Apply for BIS License', url: 'https://manakonline.bis.gov.in', desc: 'Apply for ISI Mark, CRS, or Scheme X' },
                { label: 'BIS QCO Search', url: 'https://www.services.bis.gov.in', desc: 'Check if your product has a mandatory QCO' },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: '#FFFFFF', border: '1px solid rgba(201,148,58,0.25)',
                    borderRadius: '8px', padding: '0.65rem 0.9rem',
                    textDecoration: 'none', transition: 'all 0.18s',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9943A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(201,148,58,0.12)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <ExternalLink size={14} color="#C9943A" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-600, #1B2A4A)' }}>{link.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{link.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Certification Route */}
        {data.certification_required && (
          <div style={{
            background: 'linear-gradient(135deg, #FDF0EB, #FEF5F0)',
            border: '1px solid rgba(208,74,12,0.2)',
            borderLeft: '3px solid var(--accent, #D04A0C)',
            borderRadius: '10px',
            padding: '1rem 1.1rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--accent, #D04A0C)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem',
            }}>
              MANDATORY CERTIFICATION ROUTE
            </div>
            <div style={{
              fontSize: '1.02rem', fontWeight: 800, color: 'var(--navy-600, #1B2A4A)',
              fontFamily: 'var(--font-display)',
            }}>
              {data.certification_required}
            </div>
          </div>
        )}

        {/* Cost & Timeline Estimator Card — Only for confident BIS matches */}
        {data.found_in_context && data.responseType !== 'non_bis_regulated' && (data.applicable_standards && data.applicable_standards.length > 0) && (
          <CostTimelineCard standardCode={data.applicable_standards[0].code || data.identified_product} />
        )}

        {/* Testing Requirements */}
        {data.testing_requirements && data.testing_requirements.length > 0 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--navy-600, #1B2A4A)', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '0.65rem',
            }}>
              LAB TESTING REQUIREMENTS
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', listStyle: 'none', paddingLeft: 0 }}>
              {data.testing_requirements.map((req, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    fontSize: '0.88rem', color: '#3A4562', lineHeight: '1.5',
                  }}
                >
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--navy-600, #1B2A4A)',
                    color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.62rem', fontWeight: 800, flexShrink: 0, marginTop: '1px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {i + 1}
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Checklist */}
        {data.action_checklist && data.action_checklist.length > 0 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--navy-600, #1B2A4A)', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '0.65rem',
            }}>
              ACTION ROADMAP
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.action_checklist.map((item, i) => {
                const isOpen = expandedStep === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: isOpen ? '#FAFBFD' : '#FFFFFF',
                      border: `1px solid ${isOpen ? 'rgba(27,42,74,0.2)' : 'var(--cream-400, #E2DCD0)'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      boxShadow: isOpen ? '0 4px 16px rgba(10,17,40,0.06)' : 'none',
                    }}
                  >
                    <button
                      onClick={() => setExpandedStep(isOpen ? null : i)}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.85rem 1.1rem',
                        display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: isOpen ? 'var(--navy-600, #1B2A4A)' : 'var(--cream-200, #F5F1EB)',
                        color: isOpen ? '#FFFFFF' : 'var(--navy-600, #1B2A4A)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                        fontFamily: 'var(--font-mono)', transition: 'all 0.2s',
                      }}>
                        {String(item.step).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-600, #1B2A4A)', flex: 1 }}>
                        {item.action}
                      </span>
                      {isOpen ? <ChevronUp size={15} color="#94A3B8" /> : <ChevronDown size={15} color="#94A3B8" />}
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 1.1rem 0.9rem 3.5rem',
                        fontSize: '0.85rem', color: '#64748B', lineHeight: '1.6',
                        animation: 'fadeIn 0.2s ease-out',
                      }}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Export PDF Action Bar */}
        <div style={{
          borderTop: '1px solid var(--cream-400, #E2DCD0)',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--cream-100, #FAF8F5)',
          margin: '0.5rem -1.75rem -1.5rem',
          padding: '1rem 1.75rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            📄 Need a formal compliance document? Download as formatted PDF.
          </div>
          <DownloadPdfButton data={data} variant="primary" />
        </div>
      </div>

      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:200% center; } 100% { background-position:-200% center; } }
        .cert-header-stripe {
          height: 3px;
          background: linear-gradient(90deg, #1B2A4A, #D04A0C, #C9943A, #D04A0C, #1B2A4A);
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
