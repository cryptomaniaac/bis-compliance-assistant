'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onSubmit: (text?: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, onSubmit, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (!hasMedia) {
        setIsSupported(false);
      }
    }

    return () => {
      stopRecording(false);
    };
  }, []);

  const updateInputUI = (text: string) => {
    onTranscript(text);
    if (typeof document !== 'undefined') {
      const inputEl = document.getElementById('chat-text-input') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = text;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording || isTranscribing) return;
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const detectedMime = mediaRecorder.mimeType || 'audio/webm';

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: detectedMime });
        if (audioBlob.size < 200) {
          console.warn('[VoiceInput] Recorded audio blob too small:', audioBlob.size, 'bytes');
          setIsRecording(false);
          setErrorMessage('No speech detected. Please speak closer to the mic.');
          return;
        }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const resultStr = reader.result as string;
            const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;

            console.log('[VoiceInput] Sending audio payload to /api/voice/transcribe:', {
              blobSize: audioBlob.size,
              mimeType: detectedMime,
              base64Length: base64Data.length,
            });

            const res = await fetch('/api/voice/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Data, mimeType: detectedMime }),
            });

            const data = await res.json();
            setIsTranscribing(false);

            if (res.ok && data.text) {
              const transcribedText = data.text.trim();
              console.log('[VoiceInput] Transcribe success:', transcribedText);
              updateInputUI(transcribedText);
              onSubmit(transcribedText);
            } else {
              // Detailed console error logging per requirement #4
              console.error('[VoiceInput Error] STT API Failed.', {
                status: res.status,
                statusText: res.statusText,
                errorData: data,
              });
              setErrorMessage(data?.error || `Transcription failed (${res.status})`);
            }
          };
        } catch (err: any) {
          console.error('[VoiceInput Exception] FileReader or API call error:', err);
          setIsTranscribing(false);
          setErrorMessage(err.message || 'Voice transcription failed');
        }
      };

      mediaRecorder.start(200); // Collect data chunks every 200ms
      setIsRecording(true);
    } catch (err: any) {
      console.error('[VoiceInput Exception] MediaRecorder start error:', err);
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access denied — enable in browser settings');
      } else {
        setErrorMessage('Could not access microphone');
      }
    }
  };

  const stopRecording = (triggerSubmit = true) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    } else {
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording(true);
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported in this browser"
        style={{
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          color: '#9CA3AF',
          borderRadius: '8px',
          padding: '0.6rem',
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6,
        }}
      >
        <MicOff size={16} />
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Microphone Toggle Button */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || isTranscribing}
        title={isRecording ? 'Click to stop & submit question' : 'Click to speak your product question'}
        style={{
          background: isRecording ? '#EF4444' : isTranscribing ? '#1B2A4A' : '#F0F4F0',
          border: `1.5px solid ${isRecording ? '#DC2626' : isTranscribing ? '#1B2A4A' : '#B8CDBA'}`,
          color: isRecording || isTranscribing ? '#FFFFFF' : '#2D5A30',
          borderRadius: '8px',
          padding: '0.6rem 0.75rem',
          cursor: disabled || isTranscribing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          transition: 'all 0.2s',
          boxShadow: isRecording ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
          animation: isRecording ? 'micPulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        {isTranscribing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Mic size={16} />
        )}
        <span>{isTranscribing ? 'Transcribing...' : isRecording ? 'Stop & Send' : 'Voice'}</span>
      </button>

      {/* Error Inline Banner */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            right: 0,
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={14} color="#DC2626" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', marginLeft: '0.3rem', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes micPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
