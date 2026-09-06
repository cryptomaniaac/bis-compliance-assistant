'use client';

import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { StructuredBISResponse } from '@/lib/llm';
import { exportComplianceReportPdf } from '@/lib/pdfExporter';

interface DownloadPdfButtonProps {
  data: StructuredBISResponse;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function DownloadPdfButton({
  data,
  label = 'Download Compliance Report (PDF)',
  variant = 'primary',
}: DownloadPdfButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = () => {
    try {
      setDownloading(true);
      exportComplianceReportPdf(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.55rem',
        padding: '0.65rem 1.25rem',
        borderRadius: '10px',
        fontSize: '0.85rem',
        fontWeight: 700,
        fontFamily: 'var(--font-display, inherit)',
        cursor: downloading ? 'wait' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, #1B2A4A 0%, #0A1128 100%)'
            : variant === 'outline'
            ? 'transparent'
            : 'linear-gradient(135deg, #C9943A 0%, #A8732A 100%)',
        color: variant === 'outline' ? '#1B2A4A' : '#FFFFFF',
        border: variant === 'outline' ? '1.5px solid #1B2A4A' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: variant === 'outline' ? 'none' : '0 4px 14px rgba(10, 17, 40, 0.2)',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          variant === 'outline' ? '0 4px 12px rgba(27,42,74,0.1)' : '0 6px 20px rgba(10, 17, 40, 0.3)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          variant === 'outline' ? 'none' : '0 4px 14px rgba(10, 17, 40, 0.2)';
      }}
    >
      {success ? (
        <>
          <Check size={16} color="#10B981" />
          <span style={{ color: '#10B981' }}>Downloaded PDF!</span>
        </>
      ) : (
        <>
          <Download size={16} color={variant === 'outline' ? '#1B2A4A' : '#C9943A'} />
          <span>{downloading ? 'Generating PDF...' : label}</span>
        </>
      )}
    </button>
  );
}
