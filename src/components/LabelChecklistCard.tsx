'use client';

import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Tag, Info } from 'lucide-react';
import { StructuredBISResponse } from '@/lib/llm';
import DownloadPdfButton from './DownloadPdfButton';

interface LabelChecklistCardProps {
  data: StructuredBISResponse;
}

export default function LabelChecklistCard({ data }: LabelChecklistCardProps) {
  const checklist = data.label_checklist || [];
  const isNonBis = data.responseType === 'non_bis_regulated' || checklist.length === 0;

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
            background: 'linear-gradient(135deg, #D04A0C, #C1440E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(208,74,12,0.35)',
            flexShrink: 0,
          }}>
            <Tag size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              color: 'rgba(201,148,58,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '0.2rem',
            }}>
              GEMINI VISION AUDIT
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF',
            }}>
              Packaging &amp; Label Compliance Report
            </div>
          </div>
        </div>

        {/* Official stamp badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: 'rgba(208,74,12,0.15)',
          border: '1px solid rgba(208,74,12,0.35)',
          borderRadius: '20px',
          padding: '0.3rem 0.8rem',
          flexShrink: 0,
        }}>
          <ShieldCheck size={13} color="#F97316" />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
            color: '#F97316',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            LABEL INSPECTION
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
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🏷️</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                color: 'var(--accent, #D04A0C)', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '0.2rem',
              }}>
                INSPECTED PACKAGING LABEL
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

        {/* Executive Summary */}
        <p style={{
          fontSize: '0.94rem', color: '#3A4562', lineHeight: '1.7', fontWeight: 400,
          borderBottom: '1px solid var(--cream-400, #E2DCD0)',
          paddingBottom: '1.25rem',
        }}>
          {data.summary}
        </p>

        {/* Visual Checklist or Non-BIS Info Panel */}
        {isNonBis ? (
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderLeft: '4px solid #3B82F6',
            borderRadius: '12px',
            padding: '1.25rem 1.35rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
          }}>
            <Info size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem',
              }}>
                NOT REGULATED BY BIS
              </div>
              <p style={{ fontSize: '0.9rem', color: '#1E3A8A', lineHeight: '1.65', fontWeight: 500, margin: 0 }}>
                This product is <strong>not subject to any mandatory BIS Quality Control Order (QCO)</strong>. No ISI mark, CRS mark, or BIS license number is legally required on its packaging.
              </p>
              {data.action_checklist && data.action_checklist.length > 0 && (
                <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {data.action_checklist.map((action, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#1E40AF', lineHeight: '1.5' }}>{action.action}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--navy-600, #1B2A4A)', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '0.85rem',
            }}>
              MANDATORY DECLARATIONS CHECKLIST
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {checklist.map((item, idx) => {
                const isPass = item.status === 'pass';
                const isFail = item.status === 'fail';

                const borderLeftColor = isPass ? '#10B981' : isFail ? '#EF4444' : '#F59E0B';
                const badgeBg = isPass ? '#ECFDF5' : isFail ? '#FEF2F2' : '#FFFBEB';
                const badgeBorder = isPass ? 'rgba(16,185,129,0.3)' : isFail ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)';
                const badgeTextColor = isPass ? '#065F46' : isFail ? '#991B1B' : '#92400E';
                const statusLabel = isPass ? '✓ DETECTED' : isFail ? '✗ MISSING / INVALID' : '⚠ UNCERTAIN';

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#FAFBFD',
                      border: '1px solid var(--cream-400, #E2DCD0)',
                      borderLeft: `4px solid ${borderLeftColor}`,
                      borderRadius: '10px',
                      padding: '1rem 1.15rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        {isPass ? (
                          <CheckCircle2 size={18} color="#10B981" />
                        ) : isFail ? (
                          <XCircle size={18} color="#EF4444" />
                        ) : (
                          <AlertTriangle size={18} color="#F59E0B" />
                        )}
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-600, #1B2A4A)', fontFamily: 'var(--font-display)' }}>
                          {item.item}
                        </span>
                      </div>

                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800,
                        background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeTextColor,
                        padding: '0.2rem 0.65rem', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.55', marginTop: '0.35rem', paddingLeft: '1.65rem' }}>
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              REGULATORY SOURCES:
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
                }}
              >
                <ExternalLink size={11} />
                {s.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
              </a>
            ))}
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
            📄 Need a formal audit document? Download as formatted PDF.
          </div>
          <DownloadPdfButton data={data} label="Download Audit Report (PDF)" variant="primary" />
        </div>
      </div>

      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
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
