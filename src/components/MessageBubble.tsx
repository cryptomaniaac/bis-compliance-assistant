'use client';

import ResultCard from './ResultCard';
import LabelChecklistCard from './LabelChecklistCard';
import { StructuredBISResponse } from '@/lib/llm';
import { User, ShieldCheck } from 'lucide-react';

export interface MessageItem {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: StructuredBISResponse | null;
  createdAt?: string;
}

export default function MessageBubble({ message }: { message: MessageItem }) {
  const isUser = message.role === 'user';
  const sr = message.structuredResponse;

  const isLabelReport = !isUser && Boolean(sr) && (
    sr?.responseType === 'label_analysis' || Boolean(sr?.label_checklist && sr.label_checklist.length > 0)
  );

  // Render report card ONLY when responseType is 'compliance_report', or if it has non-empty compliance details
  const isReportCard = !isUser && !isLabelReport && Boolean(sr) && (
    sr?.responseType === 'compliance_report' ||
    (sr?.responseType !== 'conversational' &&
      Boolean(
        sr?.identified_product ||
        sr?.certification_required ||
        (sr?.applicable_standards && sr.applicable_standards.length > 0)
      ))
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '0.85rem',
        marginBottom: '1.25rem',
        maxWidth: isUser ? '85%' : '96%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        width: isUser ? 'auto' : '100%'
      }}
    >
      {/* Avatar Icon */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: isUser ? '50%' : '8px',
          background: isUser ? '#C1440E' : '#1B2A4A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isUser ? '0 2px 8px rgba(193, 68, 14, 0.3)' : '0 2px 8px rgba(27, 42, 74, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {isUser ? <User size={19} /> : <ShieldCheck size={20} />}
      </div>

      {/* Bubble / Card Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Render plain-text bubble for user messages OR conversational assistant replies */}
        {!isReportCard && !isLabelReport && (
          <div
            style={{
              background: isUser ? '#1B2A4A' : '#FFFFFF',
              color: isUser ? '#FFFFFF' : '#3A3A3A',
              border: isUser ? '1px solid #101B33' : '1.5px solid #E2DCD0',
              borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              padding: '0.9rem 1.25rem',
              fontSize: '0.95rem',
              lineHeight: '1.55',
              boxShadow: isUser ? '0 4px 12px rgba(27, 42, 74, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
              whiteSpace: 'pre-wrap',
              fontWeight: isUser ? 500 : 400
            }}
          >
            {message.content}
          </div>
        )}

        {/* Render LabelChecklistCard for label_analysis responses */}
        {isLabelReport && sr && (
          <LabelChecklistCard data={sr} />
        )}

        {/* Render ResultCard for compliance_report responses */}
        {isReportCard && sr && (
          <ResultCard data={sr} />
        )}
      </div>
    </div>
  );
}
