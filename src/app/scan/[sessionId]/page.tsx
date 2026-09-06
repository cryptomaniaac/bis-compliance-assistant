'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

type PageState = 'idle' | 'uploading' | 'success' | 'completed' | 'error';

export default function ScanPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<PageState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(params).then(({ sessionId: id }) => {
      if (id) setSessionId(id);
    });
  }, [params]);

  // Listen for completion status from laptop
  useEffect(() => {
    if (state !== 'success' || !sessionId) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let channel: any = null;

    const markCompleted = () => {
      setState('completed');
      if (pollInterval) clearInterval(pollInterval);
      if (channel && supabase) supabase.removeChannel(channel);
    };

    // 1. Listen via Supabase Realtime
    if (supabase) {
      channel = supabase
        .channel(`scan-status-${sessionId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_sessions',
          filter: `id=eq.${sessionId}`,
        }, (payload: any) => {
          const status = payload.new?.status;
          if (status === 'completed' || status === 'done' || status === 'processed') {
            markCompleted();
          }
        })
        .subscribe();
    }

    // 2. Poll every 2 seconds as fallback
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/poll?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed' || data.status === 'done' || data.status === 'processed') {
            markCompleted();
          }
        }
      } catch (_) {}
    }, 2000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [state, sessionId]);

  // Helper to resize/compress image file to avoid Vercel 4.5MB payload limit
  const compressImage = (file: File, maxDim = 1280, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file); // fallback to original if canvas context unavailable
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        resolve(file); // fallback to original if image load fails
      };
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const activeSessionId = sessionId || window.location.pathname.split('/').pop() || null;
    if (!file || !activeSessionId) {
      setErrorMsg('Session ID missing. Please rescan the QR code.');
      setState('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setState('uploading');
    setErrorMsg('');

    try {
      // Compress image client-side to ensure it's under Vercel's 4.5MB payload limit
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('sessionId', activeSessionId);

      const res = await fetch('/api/scan/upload', { method: 'POST', body: formData });
      if (res.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Upload failed. Please try again.');
      }
      setState('success');
    } catch (err: any) {
      console.error('Mobile upload error:', err);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
      setState('error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A1128',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-15%',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,74,122,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%',
        width: '240px', height: '240px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(208,74,12,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease-out' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#FFFFFF',
          padding: '0.55rem 1.25rem',
          borderRadius: '12px',
          fontFamily: "'Bitter', Georgia, serif",
          fontWeight: 800, fontSize: '1.1rem',
          marginBottom: '0.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <span style={{
            background: '#D04A0C', borderRadius: '6px',
            width: '28px', height: '28px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(208,74,12,0.4)',
          }}>🛡</span>
          BIS Assist
        </div>
        <p style={{
          fontSize: '0.72rem', color: 'rgba(195,210,230,0.6)',
          fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Product Scan Portal
        </p>
      </div>

      {/* Main Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2.25rem 1.75rem',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        textAlign: 'center',
        animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* IDLE */}
        {state === 'idle' && (
          <>
            {/* Camera viewfinder icon */}
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.25rem',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(45,74,122,0.6), rgba(10,17,40,0.9))',
                border: '2px solid rgba(168,115,42,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem',
                boxShadow: '0 0 0 8px rgba(168,115,42,0.08), 0 0 0 16px rgba(168,115,42,0.04)',
                animation: 'pulseAccent 2.5s ease-in-out infinite',
              }}>📷</div>
            </div>

            <h1 style={{
              fontSize: '1.4rem', fontFamily: "'Bitter', Georgia, serif",
              fontWeight: 800, color: '#FFFFFF',
              marginBottom: '0.5rem', lineHeight: '1.3',
            }}>
              Photograph Your Product
            </h1>
            <p style={{
              fontSize: '0.88rem', color: 'rgba(195,210,230,0.7)',
              lineHeight: '1.65', marginBottom: '2rem',
              maxWidth: '280px', margin: '0 auto 2rem',
            }}>
              Take a clear photo of your product. We'll identify it and check the applicable BIS certification requirements on your laptop.
            </p>

            <label htmlFor="product-photo" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.6rem',
              background: '#D04A0C',
              color: '#FFFFFF', fontSize: '1rem', fontWeight: 700,
              padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer',
              width: '100%', maxWidth: '300px',
              boxShadow: '0 8px 24px rgba(208,74,12,0.4)',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ fontSize: '1.2rem' }}>📸</span>
              Open Camera
            </label>
            <input
              id="product-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <p style={{
              fontSize: '0.72rem', color: 'rgba(148,163,184,0.55)',
              marginTop: '1.2rem', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.04em',
            }}>
              Works on iOS Safari · Android Chrome
            </p>
          </>
        )}

        {/* UPLOADING */}
        {state === 'uploading' && (
          <>
            {preview && (
              <div style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}
                className="scan-overlay">
                <img
                  src={preview} alt="Product preview"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block', borderRadius: '12px' }}
                />
              </div>
            )}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(27,42,74,0.8)',
                border: '3px solid rgba(168,115,42,0.3)',
                borderTop: '3px solid #C9943A',
                animation: 'spin 0.9s linear infinite',
              }} />
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Uploading photo...
                </p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(195,210,230,0.6)', marginTop: '0.25rem' }}>
                  This will only take a moment
                </p>
              </div>
            </div>
          </>
        )}

        {/* SUCCESS */}
        {state === 'success' && (
          <>
            {preview && (
              <div style={{ position: 'relative', marginBottom: '1.25rem', borderRadius: '12px', overflow: 'hidden' }} className="scan-overlay">
                <img
                  src={preview} alt="Uploaded product"
                  style={{
                    width: '100%', maxHeight: '220px', objectFit: 'cover',
                    borderRadius: '12px', display: 'block',
                    border: '2px solid rgba(16,185,129,0.5)',
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: '20px', padding: '0.3rem 0.85rem', marginBottom: '0.85rem',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulseDot 1.4s infinite' }} />
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: '0.06em' }}>
                AI VISION ANALYSIS ACTIVE
              </span>
            </div>

            <h2 style={{
              fontSize: '1.25rem', fontFamily: "'Bitter', Georgia, serif",
              fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem',
            }}>
              Photo Sent to Laptop!
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'rgba(195,210,230,0.75)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Check your <strong style={{ color: '#FFFFFF' }}>laptop screen</strong> — Bharat AI is identifying the product & retrieving BIS rules now.
            </p>

            <div style={{
              background: 'rgba(10,17,40,0.6)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '0.85rem 1rem', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                <span>✓</span> Photo saved & synced to laptop
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#D04A0C', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D04A0C', animation: 'pulseDot 1s infinite' }} />
                Gemini Vision identifying product type...
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)' }}>
                <span>⏳</span> Querying 29+ BIS Quality Control Orders...
              </div>
            </div>
          </>
        )}

        {/* COMPLETED */}
        {state === 'completed' && (
          <>
            {preview && (
              <div style={{ position: 'relative', marginBottom: '1.25rem', borderRadius: '12px', overflow: 'hidden' }}>
                <img
                  src={preview} alt="Uploaded product"
                  style={{
                    width: '100%', maxHeight: '200px', objectFit: 'cover',
                    borderRadius: '12px', display: 'block',
                    border: '2px solid #10B981',
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: '20px', padding: '0.35rem 0.95rem', marginBottom: '0.85rem',
            }}>
              <span style={{ fontSize: '0.9rem', color: '#10B981' }}>✓</span>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: '0.06em' }}>
                ANALYSIS COMPLETE
              </span>
            </div>

            <h2 style={{
              fontSize: '1.3rem', fontFamily: "'Bitter', Georgia, serif",
              fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem',
            }}>
              Report Ready on Laptop!
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'rgba(195,210,230,0.8)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Your product was identified and full BIS compliance rules are displayed on your <strong style={{ color: '#FFFFFF' }}>laptop screen</strong>.
            </p>

            <div style={{
              background: 'rgba(10,17,40,0.7)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '12px', padding: '0.9rem 1rem', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
                <span>✓</span> Photo saved &amp; synced to laptop
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
                <span>✓</span> Product identified via Gemini Vision
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
                <span>✓</span> BIS compliance report generated on laptop
              </div>
            </div>

            <button
              onClick={() => { setState('idle'); setPreview(null); setErrorMsg(''); }}
              style={{
                background: '#D04A0C', color: '#FFFFFF',
                padding: '0.85rem 1.75rem', borderRadius: '12px',
                border: 'none', fontWeight: 700,
                fontSize: '0.95rem', cursor: 'pointer', width: '100%', maxWidth: '280px',
                boxShadow: '0 8px 24px rgba(208,74,12,0.4)',
                transition: 'all 0.2s',
              }}
            >
              📸 Scan Another Product
            </button>
          </>
        )}

        {/* ERROR */}
        {state === 'error' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2 style={{
              fontSize: '1.2rem', fontFamily: "'Bitter', Georgia, serif",
              fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem',
            }}>
              Upload failed
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(195,210,230,0.65)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {errorMsg || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => { setState('idle'); setPreview(null); setErrorMsg(''); }}
              style={{
                background: 'rgba(255,255,255,0.08)', color: '#FFFFFF',
                padding: '0.8rem 1.75rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)', fontWeight: 700,
                fontSize: '0.95rem', cursor: 'pointer', width: '100%', maxWidth: '240px',
                transition: 'all 0.2s',
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{
        fontSize: '0.68rem', color: 'rgba(148,163,184,0.35)',
        textAlign: 'center', fontFamily: "'Space Mono', monospace",
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        BIS Compliance Assistant · SIH26107
      </p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@700;800&family=Inter:wght@400;600&family=Space+Mono&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.6; transform:scale(0.85); }
        }
        @keyframes pulseAccent {
          0%,100% { box-shadow: 0 0 0 8px rgba(168,115,42,0.08), 0 0 0 16px rgba(168,115,42,0.04); }
          50% { box-shadow: 0 0 0 12px rgba(168,115,42,0.12), 0 0 0 22px rgba(168,115,42,0.02); }
        }
        @keyframes scanLine {
          0%   { top: 5%; opacity:1; }
          48%  { top: 92%; opacity:1; }
          50%  { top: 92%; opacity:0; }
          52%  { top: 5%; opacity:0; }
          54%  { top: 5%; opacity:1; }
          100% { top: 5%; opacity:1; }
        }
        .scan-overlay { position:relative; overflow:hidden; }
        .scan-overlay::after {
          content:'';
          position:absolute;
          left:0; right:0;
          height:3px;
          background: linear-gradient(90deg,transparent,#D04A0C,rgba(255,160,80,0.9),#D04A0C,transparent);
          box-shadow: 0 0 12px rgba(208,74,12,0.6), 0 0 24px rgba(208,74,12,0.3);
          animation: scanLine 2.4s ease-in-out infinite;
          border-radius:2px;
          z-index:10;
        }
        * { box-sizing: border-box; margin:0; padding:0; }
        body { background:#0A1128; }
        label:active { opacity:0.85; transform:scale(0.98); }
      `}</style>
    </div>
  );
}
