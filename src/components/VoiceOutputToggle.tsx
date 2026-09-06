'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Square } from 'lucide-react';

interface VoiceOutputToggleProps {
  latestBotMessage?: string;
}

export default function VoiceOutputToggle({ latestBotMessage }: VoiceOutputToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const lastSpokenTextRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('speechSynthesis' in window)) {
        setIsSupported(false);
        return;
      }
      const saved = localStorage.getItem('bis_tts_enabled');
      if (saved === 'true') {
        setEnabled(true);
      }
    }
  }, []);

  // Helper to strip markdown formatting for natural TTS speech
  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/[•\-\*]\s/g, '')
      .trim();
  };

  // Speak latest bot message when enabled and new message arrives
  useEffect(() => {
    if (!enabled || !isSupported || !latestBotMessage) return;
    const cleanText = stripMarkdown(latestBotMessage);
    if (!cleanText || cleanText === lastSpokenTextRef.current) return;

    lastSpokenTextRef.current = cleanText;
    speakText(cleanText);
  }, [latestBotMessage, enabled, isSupported]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('bis_tts_enabled', String(next));
    if (!next) {
      stopSpeaking();
    }
  };

  if (!isSupported) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {/* If speaking, show Mute/Stop button */}
      {isSpeaking ? (
        <button
          type="button"
          onClick={stopSpeaking}
          title="Stop reading response aloud"
          style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            color: '#DC2626',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            animation: 'pulseMute 1.2s infinite',
          }}
        >
          <Square size={12} fill="#DC2626" />
          <span>STOP SPEECH</span>
        </button>
      ) : (
        /* TTS Enable Toggle */
        <button
          type="button"
          onClick={toggleEnabled}
          title={enabled ? 'Voice Output Active (Click to Mute)' : 'Enable Voice Output (Read bot answers aloud)'}
          style={{
            background: enabled ? '#F0FDF4' : '#F7F4EC',
            border: `1.5px solid ${enabled ? '#86EFAC' : '#E2DCD0'}`,
            color: enabled ? '#166534' : '#1B2A4A',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
          }}
        >
          {enabled ? <Volume2 size={15} color="#16A34A" /> : <VolumeX size={15} color="#94A3B8" />}
          <span>{enabled ? 'VOICE OUT: ON' : 'VOICE OUT: OFF'}</span>
        </button>
      )}

      <style>{`
        @keyframes pulseMute {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
