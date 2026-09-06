'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2, RotateCw, Loader2, ArrowRight } from 'lucide-react';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handler for 6 digits
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        const newOtp = pasted.split('');
        setOtpDigits(newOtp);
        inputRefs.current[5]?.focus();
        return;
      }
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = cleanDigit;
    setOtpDigits(newOtp);

    // Auto-advance focus to next digit
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email) {
      setErrorMessage('Email address missing. Please re-enter your email.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/chat');
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Invalid or expired code.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || isResending) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsResending(false);

      if (res.ok) {
        setSuccessMessage('A fresh verification code was sent to your email.');
        setCooldown(45); // Start 45s cooldown
      } else {
        setErrorMessage(data.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      setIsResending(false);
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #0F172A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(201, 148, 58, 0.3)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9943A, #A8732A)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(201, 148, 58, 0.4)',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={28} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0A1128', margin: '0 0 0.3rem' }}>
            Verify Your Email
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 0.5rem' }}>
            We sent a 6-digit code to
          </p>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1B2A4A', wordBreak: 'break-all' }}>
            {email || 'your email'}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              color: '#166534',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 6-Digit Code Inputs */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.8rem', textAlign: 'center' }}>
              ENTER 6-DIGIT VERIFICATION CODE
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    borderRadius: '10px',
                    border: digit ? '2px solid #1B2A4A' : '1.5px solid #CBD5E1',
                    background: digit ? '#F8FAFC' : '#FFFFFF',
                    color: '#0A1128',
                    outline: 'none',
                    boxShadow: digit ? '0 0 10px rgba(27, 42, 74, 0.15)' : 'none',
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.6rem' }}>
              ⏱️ Code expires in 10 minutes
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #1B2A4A, #0A1128)',
              border: '1px solid #C9943A',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(27, 42, 74, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div style={{ marginTop: '1.8rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={cooldown > 0 || isResending}
            style={{
              background: 'none',
              border: 'none',
              color: cooldown > 0 || isResending ? '#94A3B8' : '#1B2A4A',
              fontWeight: 700,
              cursor: cooldown > 0 || isResending ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {isResending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Resending...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <RotateCw size={14} />
                <span>Resend in {cooldown}s</span>
              </>
            ) : (
              <span>Resend Code</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A1128', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
