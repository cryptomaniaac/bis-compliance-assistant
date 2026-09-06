'use client';

import { Clock, Coins, FileText, AlertCircle, Bookmark } from 'lucide-react';
import { getEstimatesForStandard, StandardEstimate } from '@/lib/estimates';

interface CostTimelineCardProps {
  standardCode?: string;
  estimateOverride?: StandardEstimate;
}

export default function CostTimelineCard({ standardCode, estimateOverride }: CostTimelineCardProps) {
  const est = estimateOverride || getEstimatesForStandard(standardCode);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FAFBFD 0%, #F5F7FA 100%)',
        border: '1px solid var(--cream-400, #E2DCD0)',
        borderLeft: '4px solid #C9943A',
        borderRadius: '12px',
        padding: '1.1rem 1.25rem',
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 4px 16px rgba(10,17,40,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(201,148,58,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={14} color="#A8732A" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#A8732A',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            ESTIMATED COST &amp; TIMELINE SUMMARY
          </span>
        </div>

        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: est.hasVerifiedData ? '#10B981' : '#64748B',
            background: est.hasVerifiedData ? 'rgba(16,185,129,0.12)' : '#FFFFFF',
            padding: '0.15rem 0.5rem',
            borderRadius: '10px',
            border: est.hasVerifiedData ? '1px solid rgba(16,185,129,0.3)' : '1px solid #E2DCD0',
          }}
        >
          {est.hasVerifiedData ? 'VERIFIED BIS FIGURES' : 'APPROXIMATE ESTIMATE'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {/* Timeline */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '0.75rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid rgba(27,42,74,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1B2A4A', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} color="#1B2A4A" />
            <span>Process Duration</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1B2A4A', marginTop: '0.25rem', lineHeight: '1.3' }}>
            {est.duration}
          </div>
        </div>

        {/* Lab Testing Cost */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '0.75rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid rgba(27,42,74,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D04A0C', fontSize: '0.75rem', fontWeight: 700 }}>
            <Coins size={13} color="#D04A0C" />
            <span>Lab Testing Cost</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D04A0C', marginTop: '0.25rem', lineHeight: '1.3' }}>
            {est.testingCost}
          </div>
        </div>

        {/* Application Fee */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '0.75rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid rgba(27,42,74,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.75rem', fontWeight: 700 }}>
            <FileText size={13} color="#10B981" />
            <span>BIS Official Fees</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem', lineHeight: '1.3' }}>
            {est.applicationFee}
          </div>
        </div>
      </div>

      {/* Citation Footnote */}
      <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#FFFFFF', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #EDE7DC' }}>
        <Bookmark size={12} color="#C9943A" />
        <span style={{ fontWeight: 600 }}>{est.sourceNote}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: '#64748B' }}>
          <AlertCircle size={12} color="#A8732A" style={{ flexShrink: 0 }} />
          <span>{est.disclaimer}</span>
        </div>
        <a
          href="/labs"
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#1B2A4A',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Find a testing lab near you →
        </a>
      </div>
    </div>
  );
}
