'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import MessageBubble, { MessageItem } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ResultCard from './ResultCard';
import { Send, RefreshCw, ShieldCheck, FileText, ArrowRight, Camera, X, QrCode, CheckCircle, Edit3, Sparkles, MessageCircle, BookOpen, Zap, Upload, ExternalLink, Tag } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import VoiceInput from './VoiceInput';
import VoiceOutputToggle from './VoiceOutputToggle';
import { StructuredBISResponse } from '@/lib/llm';

// Public Supabase client for Realtime subscription on laptop side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseRealtime = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface ChatWindowProps {
  initialPrompt?: string;
}

// Extended message type to support scan thumbnail display
interface ScanMessage extends MessageItem {
  scanImageUrl?: string;
  scanProductGuess?: string;
  scanSessionId?: string;
  isScanLoading?: boolean;
  scanUnsure?: boolean;
}

const GREETING_MESSAGE = `Hi there! 👋 I'm **Bharat**, your personal BIS compliance consultant.

Tell me about the product you're building or selling in India — even a rough description works. I'll identify the exact Indian Standards (IS codes), testing requirements, and certification route you need, step by step.

What are you working on?`;

const EXAMPLE_CHIPS = [
  { label: '💡 LED Bulbs', query: 'I manufacture LED bulbs and lighting products sold in India' },
  { label: '🫖 Electric Kettle', query: 'I am launching an electric kettle for kitchen use in India' },
  { label: '🧸 Children\'s Toys', query: 'I make plastic toys for children sold in India' },
  { label: '💧 Packaged Water', query: 'I produce packaged mineral drinking water in India' },
  { label: '🧯 Fire Extinguisher', query: 'I manufacture portable fire extinguishers for commercial use' },
  { label: '📱 Power Bank', query: 'I sell lithium-ion power banks imported from China' },
];

const INPUT_PLACEHOLDERS = [
  "e.g. I manufacture LED bulbs sold in India...",
  "e.g. My startup sells electric kettles...",
  "e.g. I import packaged mineral water...",
  "e.g. We make children's plastic toys...",
  "e.g. I sell lithium-ion power banks...",
];

const CAPABILITY_CARDS = [
  { icon: '📋', title: 'IS Standard Lookup', desc: 'Identify exact IS codes for any product category' },
  { icon: '🏭', title: 'Certification Route', desc: 'CRS vs ISI Mark vs Scheme X — we tell you which' },
  { icon: '🧪', title: 'Testing Guidance', desc: 'Know which NABL labs to test at and what they check' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

export default function ChatWindow({ initialPrompt }: ChatWindowProps) {
  const [messages, setMessages] = useState<ScanMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isNewSession, setIsNewSession] = useState(false);
  const [conversationReady, setConversationReady] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const pendingPromptRef = useRef<string | null>(initialPrompt || null);
  const processedSessionsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('bis_chat_language');
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    localStorage.setItem('bis_chat_language', newLang);
  };

  // --- Scan Feature State ---
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanSessionId, setScanSessionId] = useState<string | null>(null);
  const [scanQrDataUrl, setScanQrDataUrl] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'waiting' | 'received' | 'identifying' | 'timeout'>('idle');
  const [activeScanType, setActiveScanType] = useState<'product' | 'label'>('product');
  const activeScanTypeRef = useRef<'product' | 'label'>('product');
  const [scanTimeoutRemaining, setScanTimeoutRemaining] = useState(300);
  const [scanLoadingStep, setScanLoadingStep] = useState(0);
  const [uploadImageLoading, setUploadImageLoading] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  const runIdentifyRef = useRef<(imageUrl: string, sessionId: string, isDesktop?: boolean, scanTypeOverride?: 'product' | 'label') => void>(() => {});
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const SCAN_LOADING_STEPS = [
    { label: 'Photo received — processing image...', color: '#10B981', icon: '✓' },
    { label: 'Identifying product with Gemini Vision...', color: '#C1440E', pulse: true },
    { label: 'Fetching BIS standards from database...', color: '#1B2A4A', pulse: true },
    { label: 'Generating compliance report...', color: '#1B2A4A', pulse: true },
  ];

  // Fetch authenticated user profile for personalized greeting
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.name) {
          setUserName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  // ── Sync initialPrompt into ref when prop changes ──────────────────────────
  useEffect(() => {
    if (initialPrompt) {
      pendingPromptRef.current = initialPrompt;
    }
  }, [initialPrompt]);

  // ── Rotate input placeholders ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % INPUT_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Init conversation ─────────────────────────────────────────────────────
  useEffect(() => {
    async function initConversation() {
      const storedId = localStorage.getItem('bis_conversation_id');
      if (storedId) {
        setConversationId(storedId);
        try {
          const res = await fetch(`/api/conversations/${storedId}/messages`);
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            const formatted: ScanMessage[] = data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              structuredResponse: m.structured_response,
            }));
            // If there's a pending prompt from browse, ignore history and fire fresh
            if (pendingPromptRef.current) {
              setMessages([]);
            } else {
              setMessages(formatted);
            }
          }
        } catch (e) {
          console.error('Failed to load past messages:', e);
        }
      } else {
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userSessionId: `session_${Date.now()}` }),
          });
          const data = await res.json();
          if (data.conversationId) {
            setConversationId(data.conversationId);
            localStorage.setItem('bis_conversation_id', data.conversationId);
            setIsNewSession(true);
          }
        } catch (e) {
          console.error('Failed to create new conversation:', e);
        }
      }
      // Signal that conversation is ready — pending prompt can now fire
      setConversationReady(true);
    }
    initConversation();
  }, []);

  // ── Fire pending prompt only after conversation is ready ─────────────────
  useEffect(() => {
    if (conversationReady && pendingPromptRef.current) {
      const prompt = pendingPromptRef.current;
      pendingPromptRef.current = null; // clear so it doesn't re-fire
      handleSend(prompt);
    }
  }, [conversationReady]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Text Chat Send ─────────────────────────────────────────────────────────
  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setInput('');
    setIsNewSession(false);
    const userMsg: ScanMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || localStorage.getItem('bis_conversation_id'),
          message: queryText,
          targetLanguage: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.structuredResponse) {
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem('bis_conversation_id', data.conversationId);
        }
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.message || data.structuredResponse.summary,
            structuredResponse: data.structuredResponse,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I'm sorry, I couldn't retrieve the compliance guidelines for "${queryText}". Please try again or check the official BIS portal.`,
            structuredResponse: null,
          },
        ]);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while connecting to the BIS compliance database. Please try again.',
          structuredResponse: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    localStorage.removeItem('bis_conversation_id');
    setMessages([]);
    setIsNewSession(false);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSessionId: `session_${Date.now()}` }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('bis_conversation_id', data.conversationId);
        setIsNewSession(true);
      }
    } catch (e) {
      console.error('New chat creation error:', e);
    }
  };

  // ── Scan Feature: Cleanup helpers ─────────────────────────────────────────
  const clearScanTimers = useCallback(() => {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (scanCountdownRef.current) clearInterval(scanCountdownRef.current);
    if (scanPollRef.current) clearInterval(scanPollRef.current);
    scanTimeoutRef.current = null;
    scanCountdownRef.current = null;
    scanPollRef.current = null;
  }, []);

  const unsubscribeRealtime = useCallback(() => {
    if (realtimeChannelRef.current && supabaseRealtime) {
      supabaseRealtime.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  }, []);

  const closeScanModal = useCallback(() => {
    setScanModalOpen(false);
    clearScanTimers();
    unsubscribeRealtime();
    setScanStatus('idle');
    setScanTimeoutRemaining(300);
  }, [clearScanTimers, unsubscribeRealtime]);

  const selectedLanguageRef = useRef(selectedLanguage);
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // ── Scan Feature: Identify product / label via vision API ─────────────────
  const runIdentify = useCallback(async (imageUrl: string, sessionId: string, isDesktop = false, scanTypeOverride?: 'product' | 'label') => {
    const activeConvId = conversationId || localStorage.getItem('bis_conversation_id');
    const currentLang = selectedLanguageRef.current || 'en';
    const scanType = scanTypeOverride || activeScanTypeRef.current || 'product';

    const scanLoadingMsg: ScanMessage = {
      role: 'user',
      content: isDesktop
        ? (scanType === 'label' ? '🖼️ Uploaded packaging label image' : '🖼️ Uploaded product image')
        : (scanType === 'label' ? '🏷️ Scanned packaging label photo' : '📷 Scanned product photo'),
      scanImageUrl: imageUrl,
      isScanLoading: true,
      scanSessionId: sessionId,
    };
    setMessages(prev => [...prev, scanLoadingMsg]);
    setScanStatus('identifying');
    setScanLoadingStep(0);

    // Animate steps while loading
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, 3);
      setScanLoadingStep(stepIdx);
    }, 1400);

    try {
      // ── STEP 1: Vision API call ──
      const identifyRes = await fetch('/api/scan/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          sessionId,
          conversationId: activeConvId,
          scanType,
          targetLanguage: currentLang,
        }),
      });

      const identifyData = await identifyRes.json();

      if (!identifyRes.ok) {
        throw new Error(identifyData.details || identifyData.error || `Identify failed: ${identifyRes.status}`);
      }

      const returnedConvId = identifyData.conversationId || activeConvId;
      if (returnedConvId && returnedConvId !== conversationId) {
        setConversationId(returnedConvId);
        localStorage.setItem('bis_conversation_id', returnedConvId);
      }

      // If scanType === 'label', identifyData.structuredResponse IS the full label inspection report
      if (scanType === 'label' && identifyData.structuredResponse) {
        setMessages(prev =>
          prev.map(m =>
            m.scanSessionId === sessionId
              ? { ...m, isScanLoading: false, content: `🏷️ Scanned: ${identifyData.productDescription || 'Packaging Label'}` }
              : m
          )
        );

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: identifyData.structuredResponse.summary || '',
            structuredResponse: identifyData.structuredResponse,
          },
        ]);

        try {
          await fetch('/api/scan/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
        } catch (_) {}

        return;
      }

      // For scanType === 'product' (ORIGINAL PRODUCT SCAN FLOW)
      const productDescription = identifyData.productDescription || 'this product';

      setMessages(prev =>
        prev.map(m =>
          m.scanSessionId === sessionId
            ? { ...m, isScanLoading: false, content: `📷 Scanned: ${productDescription}` }
            : m
        )
      );

      // Show intro message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `🔍 Identified product: **${productDescription}**. Fetching BIS compliance requirements...`,
          structuredResponse: null,
        },
      ]);

      setScanLoadingStep(2);

      // STEP 2: Compliance — call /api/chat with product name & current language
      const chatQuery = `I have a ${productDescription}. What BIS certification and IS standards apply to this product in India?`;
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: returnedConvId,
          message: chatQuery,
          targetLanguage: currentLang,
        }),
      });

      const chatData = await chatRes.json();

      if (chatRes.ok && chatData.structuredResponse) {
        if (chatData.conversationId && chatData.conversationId !== conversationId) {
          setConversationId(chatData.conversationId);
          localStorage.setItem('bis_conversation_id', chatData.conversationId);
        }
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: chatData.structuredResponse.summary || '',
            structuredResponse: chatData.structuredResponse,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Here's what I know about **${productDescription}** for BIS compliance in India. You can also type your question below for more details.`,
            structuredResponse: null,
          },
        ]);
      }

      // Mark session as completed so phone UI updates to "Analysis Complete"
      try {
        await fetch('/api/scan/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (_) {}

    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Identify error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.scanSessionId === sessionId
            ? { ...m, isScanLoading: false, content: '📷 Scanned photo' }
            : m
        )
      );
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I received your photo but ran into an issue identifying it. Please try scanning again with better lighting, or type your product description directly below 👇`,
          structuredResponse: null,
        },
      ]);
    } finally {
      setScanStatus('idle');
      setScanLoadingStep(0);
    }
  }, [conversationId]);

  // Always keep ref in sync with latest runIdentify
  useEffect(() => { runIdentifyRef.current = runIdentify; }, [runIdentify]);

  // Helper to resize/compress image file to avoid Vercel 4.5MB payload limit
  const compressImage = (file: File, maxDim = 1280, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve) => {
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
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  // ── Desktop Image Upload ──────────────────────────────────────────────────
  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    if (uploadInputRef.current) uploadInputRef.current.value = '';

    setUploadImageLoading(true);
    try {
      const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `upload_${Date.now()}`;

      // Create scan session
      try {
        await fetch('/api/scan/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversationId || localStorage.getItem('bis_conversation_id'),
            scanType: activeScanTypeRef.current || 'product',
          }),
        });
      } catch (_) {}

      // Compress image client-side to ensure it's under Vercel's 4.5MB payload limit
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });

      // Upload file via the same upload endpoint mobile uses
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('sessionId', sessionId);

      const uploadRes = await fetch('/api/scan/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.imageUrl || uploadData.url;
      if (!imageUrl) throw new Error('No image URL returned');

      runIdentifyRef.current(imageUrl, sessionId, true, activeScanTypeRef.current || 'product');
    } catch (err: any) {
      console.error('Desktop upload error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Image upload failed. Please try again or type your product description.', structuredResponse: null },
      ]);
    } finally {
      setUploadImageLoading(false);
    }
  };

  // ── Scan Feature: Open scan modal ─────────────────────────────────────────
  const openScanModal = async (scanType: 'product' | 'label' = 'product') => {
    if (!supabaseRealtime) {
      alert('Scan feature requires Supabase to be configured. Please use the text chat instead.');
      return;
    }

    setActiveScanType(scanType);
    activeScanTypeRef.current = scanType;

    clearScanTimers();
    setScanModalOpen(true);
    setScanStatus('waiting');
    setScanQrDataUrl(null);
    setScanTimeoutRemaining(300);

    let newSessionId: string = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `scan_${Date.now()}`;
    try {
      const res = await fetch('/api/scan/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || localStorage.getItem('bis_conversation_id'),
          scanType,
        }),
      });
      const data = await res.json();
      if (data && data.sessionId) newSessionId = data.sessionId;
    } catch (err: any) {
      console.warn('Scan session creation API fallback to generated ID:', err);
    }

    setScanSessionId(newSessionId);

    const scanUrl = `${window.location.origin}/scan/${newSessionId}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 220,
        margin: 2,
        color: { dark: scanType === 'label' ? '#C1440E' : '#1B2A4A', light: '#FFFFFF' },
      });
      setScanQrDataUrl(qrDataUrl);
    } catch (qrErr) {
      console.error('QR generation failed:', qrErr);
    }

    const handleUploadDetected = (imageUrl: string) => {
      if (processedSessionsRef.current.has(newSessionId)) return;
      processedSessionsRef.current.add(newSessionId);

      clearScanTimers();
      unsubscribeRealtime();
      closeScanModal();
      // Use ref so we always call the latest runIdentify with fresh conversationId & scanType
      setTimeout(() => runIdentifyRef.current(imageUrl, newSessionId, false, scanType), 50);
    };

    const channel = supabaseRealtime
      .channel(`scan-session-${newSessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'scan_sessions',
        filter: `id=eq.${newSessionId}`,
      }, (payload: any) => {
        const newStatus = payload.new?.status;
        const imageUrl = payload.new?.image_url;
        if (newStatus === 'uploaded' && imageUrl) handleUploadDetected(imageUrl);
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    scanPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/poll?sessionId=${encodeURIComponent(newSessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'uploaded' && data.imageUrl) handleUploadDetected(data.imageUrl);
        }
      } catch (_) {}
    }, 2000);

    scanTimeoutRef.current = setTimeout(() => {
      setScanStatus('timeout');
      unsubscribeRealtime();
    }, SCAN_TIMEOUT_MS);

    scanCountdownRef.current = setInterval(() => {
      setScanTimeoutRemaining(prev => {
        if (prev <= 1) { clearScanTimers(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const regenerateScan = () => {
    closeScanModal();
    setTimeout(() => openScanModal(activeScanTypeRef.current || 'product'), 100);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── QR Code Modal ── */}
      {scanModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16, 27, 51, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeScanModal(); }}
        >
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ background: '#1B2A4A', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: '#C1440E', borderRadius: '6px', padding: '0.35rem', display: 'flex' }}>
                  <QrCode size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 800, fontFamily: "'Bitter', Georgia, serif", fontSize: '1rem' }}>Scan with Your Phone</div>
                  <div style={{ color: '#8BA3C7', fontSize: '0.72rem', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>No app install needed</div>
                </div>
              </div>
              <button onClick={closeScanModal} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#FFFFFF', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.75rem 1.5rem', textAlign: 'center' }}>
              {scanStatus === 'timeout' ? (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⏱️</div>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: "'Bitter', Georgia, serif", fontWeight: 800, color: '#1B2A4A', marginBottom: '0.5rem' }}>Scan timed out</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem', lineHeight: '1.6' }}>No photo was received within 5 minutes. Generate a new QR code or type your product description instead.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button onClick={regenerateScan} style={{ background: '#1B2A4A', color: '#FFFFFF', padding: '0.7rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={14} /> Generate New QR Code
                    </button>
                    <button onClick={closeScanModal} style={{ background: '#F7F4EC', color: '#1B2A4A', padding: '0.7rem 1.25rem', borderRadius: '8px', border: '1.5px solid #E5E0D5', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                      Type Instead
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: '1.6', marginBottom: '1.25rem', maxWidth: '300px', margin: '0 auto 1.25rem' }}>
                    Point your phone's camera at this QR code. It opens a camera page — photograph your product and the result appears here instantly.
                  </p>
                  <div style={{ display: 'inline-block', padding: '12px', background: '#FFFFFF', border: '2px solid #1B2A4A', borderRadius: '12px', boxShadow: '0 4px 16px rgba(27,42,74,0.12)', marginBottom: '1rem', position: 'relative' }}>
                    {scanQrDataUrl ? (
                      <img src={scanQrDataUrl} alt="Scan QR Code" style={{ display: 'block', width: '200px', height: '200px' }} />
                    ) : (
                      <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #E5E0D5', borderTop: '3px solid #1B2A4A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', animation: 'pulseDot 1.4s infinite' }} />
                    <span style={{ fontSize: '0.78rem', fontFamily: "'Space Mono', monospace", color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Waiting for photo · {formatCountdown(scanTimeoutRemaining)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: "'Space Mono', monospace" }}>QR expires in {formatCountdown(scanTimeoutRemaining)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Chat Layout ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', maxHeight: '1000px', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 1rem', gap: '1rem' }}>

        {/* Top Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1.5px solid #E2DCD0', boxShadow: '0 2px 8px rgba(27, 42, 74, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#1B2A4A', padding: '0.45rem', borderRadius: '6px', color: '#FFFFFF' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1B2A4A' }}>Bharat — BIS Compliance Consultant</h2>
                {/* Online indicator */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '0.15rem 0.5rem', borderRadius: '20px', color: '#065F46', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulseDot 1.4s infinite' }} />
                  ONLINE
                </span>
                {messages.length > 0 && (
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: '#F7F4EC', border: '1px solid #E2DCD0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#1B2A4A', fontWeight: 700 }}>
                    {messages.length} MSGS
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.1rem' }}>
                Grounding against official Indian Standards &amp; BIS Quality Control Orders
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Language Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F7F4EC', border: '1px solid #E2DCD0', borderRadius: '6px', padding: '0.35rem 0.6rem' }}>
              <span style={{ fontSize: '0.9rem' }}>
                {LANGUAGES.find(l => l.code === selectedLanguage)?.flag || '🌐'}
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Select AI Chatbot Language"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#1B2A4A',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingRight: '0.1rem',
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <VoiceOutputToggle latestBotMessage={messages.filter(m => m.role === 'assistant').pop()?.content} />
            <button
              onClick={startNewChat}
              style={{ background: '#F7F4EC', border: '1px solid #E2DCD0', color: '#1B2A4A', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
            >
              <RefreshCw size={13} />
              <span>NEW SESSION</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#FBF9F5', borderRadius: '12px', border: '1.5px solid #E2DCD0', display: 'flex', flexDirection: 'column' }}>

          {messages.length === 0 && !isLoading ? (
            /* ── Welcome / Empty State ── */
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '680px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

              {/* Greeting bubble from Bharat */}
              <div style={{ width: '100%', textAlign: 'left', animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B2A4A, #2D4A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(27,42,74,0.2)' }}>
                    <ShieldCheck size={18} color="#FFFFFF" />
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1.5px solid #E2DCD0', borderRadius: '0 12px 12px 12px', padding: '1rem 1.25rem', maxWidth: '520px', boxShadow: '0 2px 8px rgba(27,42,74,0.05)', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#C1440E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      BHARAT · BIS CONSULTANT
                    </div>
                    <p style={{ fontSize: '0.96rem', color: '#1B2A4A', lineHeight: '1.65', fontWeight: 500 }}>
                      Hi {userName ? userName.split(' ')[0] : 'there'}! 👋 I'm <strong>Bharat</strong>, your personal BIS compliance guide.
                    </p>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: '1.65', marginTop: '0.5rem' }}>
                      Tell me about the product you're building or selling in India — even a rough description works. I'll identify the exact IS codes, testing requirements, and the right certification route for you.
                    </p>
                    <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: '1.65', marginTop: '0.5rem', fontWeight: 600 }}>
                      What are you working on? 🚀
                    </p>
                  </div>
                </div>
              </div>

              {/* Capability Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
                {CAPABILITY_CARDS.map((card, i) => (
                  <div key={i} style={{ background: '#FFFFFF', border: '1.5px solid #E2DCD0', borderRadius: '10px', padding: '0.85rem', textAlign: 'left', boxShadow: '0 1px 4px rgba(27,42,74,0.04)' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{card.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', marginBottom: '0.25rem' }}>{card.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: '1.4' }}>{card.desc}</div>
                  </div>
                ))}
              </div>

              {/* Example Chips */}
              <div style={{ width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1B2A4A', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', textAlign: 'left' }}>
                  ✨ Try an example:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {EXAMPLE_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.query)}
                      style={{ background: '#FFFFFF', border: '1.5px solid #E2DCD0', color: '#1B2A4A', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 0.95rem', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(27, 42, 74, 0.05)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C1440E'; (e.currentTarget as HTMLElement).style.color = '#C1440E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F2'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2DCD0'; (e.currentTarget as HTMLElement).style.color = '#1B2A4A'; (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan CTAs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', width: '100%', animation: 'fadeIn 0.7s ease-out' }}>
                <div
                  style={{ padding: '0.9rem 1.1rem', background: '#EBF0F7', borderRadius: '10px', border: '1.5px dashed #1B2A4A', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => openScanModal('product')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && openScanModal('product')}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#D6E0F0'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = '#EBF0F7'}
                >
                  <div style={{ background: '#1B2A4A', borderRadius: '8px', padding: '0.5rem', color: '#FFFFFF', flexShrink: 0, display: 'flex' }}>
                    <Camera size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B2A4A' }}>Scan Product</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.1rem' }}>Identify product via phone</div>
                  </div>
                </div>

                <div
                  style={{ padding: '0.9rem 1.1rem', background: '#FFF3EB', borderRadius: '10px', border: '1.5px dashed #C1440E', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => openScanModal('label')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && openScanModal('label')}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#FDE8DB'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = '#FFF3EB'}
                >
                  <div style={{ background: '#C1440E', borderRadius: '8px', padding: '0.5rem', color: '#FFFFFF', flexShrink: 0, display: 'flex' }}>
                    <Tag size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#C1440E' }}>Scan Label / Packaging</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.1rem' }}>Verify ISI mark &amp; declarations</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                // Render scan image thumbnail for user scan messages
                if (msg.scanImageUrl) {
                  return (
                    <div key={idx} style={{ marginBottom: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <div style={{ maxWidth: '320px', background: '#FFFFFF', border: '1.5px solid #E2DCD0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(27,42,74,0.06)' }}>
                          <img src={msg.scanImageUrl} alt="Scanned product" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                          <div style={{ padding: '0.5rem 0.75rem', background: '#F7F4EC', borderTop: '1px solid #E2DCD0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#1B2A4A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <Camera size={11} /> {msg.content?.startsWith('🖼️') ? 'UPLOADED FROM DEVICE' : 'SCANNED VIA PHONE'}
                          </div>
                        </div>
                      </div>

                      {msg.isScanLoading && (
                        <div
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #1B2A4A',
                            borderRadius: '12px',
                            padding: '1.1rem 1.25rem',
                            maxWidth: '400px',
                            boxShadow: '0 4px 16px rgba(27, 42, 74, 0.08)',
                            animation: 'fadeIn 0.3s ease-out',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#1B2A4A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                              <div style={{ width: '16px', height: '16px', border: '2.5px solid #FFFFFF', borderTop: '2.5px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1B2A4A', fontFamily: 'var(--font-display)' }}>Analyzing Image</div>
                              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#C1440E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GEMINI VISION AI · BIS AUDIT</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #EAE5D9', paddingTop: '0.65rem' }}>
                            {SCAN_LOADING_STEPS.map((step, si) => (
                              <div
                                key={si}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  fontSize: si === scanLoadingStep ? '0.82rem' : '0.78rem',
                                  color: si < scanLoadingStep ? '#10B981' : si === scanLoadingStep ? step.color : '#D1D5DB',
                                  fontWeight: si === scanLoadingStep ? 700 : 500,
                                  transition: 'all 0.4s ease',
                                }}
                              >
                                {si < scanLoadingStep
                                  ? <span style={{ color: '#10B981' }}>✓</span>
                                  : si === scanLoadingStep
                                  ? <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: step.color, display: 'inline-block', animation: 'pulseDot 1s infinite', flexShrink: 0 }} />
                                  : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D1D5DB', display: 'inline-block', flexShrink: 0 }} />
                                }
                                {step.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.scanUnsure && msg.scanProductGuess && (
                        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2DCD0', borderRadius: '12px', padding: '1rem 1.25rem', maxWidth: '380px', boxShadow: '0 2px 8px rgba(27,42,74,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🤔</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1B2A4A', fontFamily: 'var(--font-display)' }}>Not sure what this is</span>
                          </div>
                          <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: '0.85rem', lineHeight: '1.5' }}>
                            I think this might be a <strong style={{ color: '#1B2A4A' }}>{msg.scanProductGuess}</strong> — is that right?
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setMessages(prev => prev.filter(m => m !== msg));
                                handleSend(`I have a ${msg.scanProductGuess}. What BIS certification do I need?`);
                              }}
                              style={{ background: '#1B2A4A', color: '#FFFFFF', padding: '0.5rem 0.9rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <CheckCircle size={13} /> Yes, analyse this
                            </button>
                            <button
                              onClick={() => {
                                setMessages(prev => prev.filter(m => m !== msg));
                                setInput('I manufacture a ');
                                document.getElementById('chat-text-input')?.focus();
                              }}
                              style={{ background: '#F7F4EC', color: '#1B2A4A', padding: '0.5rem 0.9rem', borderRadius: '6px', border: '1.5px solid #E2DCD0', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Edit3 size={13} /> Let me type instead
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Render assistant message with follow-up chips
                if (msg.role === 'assistant' && msg.structuredResponse) {
                  const followUps = msg.structuredResponse.follow_up_questions;
                  return (
                    <div key={idx} style={{ marginBottom: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <MessageBubble message={msg} />
                      {/* Follow-up question chips */}
                      {followUps && followUps.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '0.25rem' }}>
                          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                            💬 Continue the conversation:
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {followUps.map((q, qi) => (
                              <button
                                key={qi}
                                onClick={() => handleSend(q)}
                                style={{ background: '#FFFFFF', border: '1.5px solid #C3D0E5', color: '#1B2A4A', fontSize: '0.83rem', fontWeight: 600, padding: '0.45rem 0.9rem', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(27, 42, 74, 0.06)', transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', lineHeight: '1.4', textAlign: 'left' }}
                                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#1B2A4A'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#1B2A4A'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.color = '#1B2A4A'; (e.currentTarget as HTMLElement).style.borderColor = '#C3D0E5'; }}
                              >
                                <MessageCircle size={12} style={{ flexShrink: 0 }} />
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return <MessageBubble key={idx} message={msg} />;
              })}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '0.65rem', background: '#FFFFFF', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #E2DCD0', boxShadow: '0 4px 14px rgba(27, 42, 74, 0.06)', alignItems: 'center' }}
        >
          {/* Hidden file input for desktop image upload */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleDesktopImageUpload}
          />

          {/* QR/Phone Scan Product button */}
          <button
            type="button"
            onClick={() => openScanModal('product')}
            title="Scan product with phone via QR code"
            style={{ background: '#EBF0F7', border: '1.5px solid #C3D0E5', color: '#1B2A4A', borderRadius: '7px', padding: '0.6rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#1B2A4A'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#1B2A4A'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#EBF0F7'; (e.currentTarget as HTMLElement).style.color = '#1B2A4A'; (e.currentTarget as HTMLElement).style.borderColor = '#C3D0E5'; }}
          >
            <Camera size={15} />
            <span>Scan Product</span>
          </button>

          {/* QR/Phone Scan Label button */}
          <button
            type="button"
            onClick={() => openScanModal('label')}
            title="Scan packaging/label with phone via QR code"
            style={{ background: '#FFF3EB', border: '1.5px solid #FDBA74', color: '#C1440E', borderRadius: '7px', padding: '0.6rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#C1440E'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#C1440E'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#FFF3EB'; (e.currentTarget as HTMLElement).style.color = '#C1440E'; (e.currentTarget as HTMLElement).style.borderColor = '#FDBA74'; }}
          >
            <Tag size={15} />
            <span>Scan Label</span>
          </button>

          {/* Desktop upload button */}
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploadImageLoading || scanStatus === 'identifying'}
            title="Upload product image from your device"
            style={{ background: uploadImageLoading ? '#F7F4EC' : '#F0F4F0', border: '1.5px solid #B8CDBA', color: '#2D5A30', borderRadius: '7px', padding: '0.6rem 0.75rem', cursor: uploadImageLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap', opacity: uploadImageLoading ? 0.7 : 1 }}
            onMouseOver={e => { if (!uploadImageLoading) { (e.currentTarget as HTMLElement).style.background = '#2D5A30'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#2D5A30'; } }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#F0F4F0'; (e.currentTarget as HTMLElement).style.color = '#2D5A30'; (e.currentTarget as HTMLElement).style.borderColor = '#B8CDBA'; }}
          >
            {uploadImageLoading
              ? <div style={{ width: '14px', height: '14px', border: '2px solid #2D5A30', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <Upload size={15} />}
            <span>{uploadImageLoading ? 'Uploading...' : 'Upload Image'}</span>
          </button>

          {/* Web Speech STT Voice Input Button */}
          <VoiceInput
            onTranscript={(text) => setInput(text)}
            onSubmit={(text) => handleSend(text)}
            disabled={isLoading}
          />

          <input
            id="chat-text-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={INPUT_PLACEHOLDERS[placeholderIdx]}
            disabled={isLoading}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '0.6rem 0.8rem', fontSize: '0.95rem', color: '#3A3A3A', fontFamily: 'inherit', background: 'transparent', transition: 'placeholder-color 0.3s' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary"
            style={{ opacity: isLoading || !input.trim() ? 0.5 : 1, cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', padding: '0.65rem 1.4rem', flexShrink: 0 }}
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  );
}
