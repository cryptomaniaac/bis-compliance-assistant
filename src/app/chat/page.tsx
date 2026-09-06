'use client';

import { useSearchParams } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';

function ChatContent() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt') || undefined;

  return <ChatWindow initialPrompt={promptParam} />;
}

function ChatLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 60px)',
        gap: '1rem',
        color: '#64748B',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          background: '#1B2A4A',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      >
        <ShieldCheck size={24} color="#FFFFFF" />
      </div>
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.82rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#6B7280',
        }}
      >
        Loading BIS Assistant...
      </p>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatContent />
    </Suspense>
  );
}
