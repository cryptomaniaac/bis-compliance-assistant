'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Loader2, Eye, EyeOff, Lightbulb } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/chat';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── INTERACTIVE LAMP STATE ──
  const [isLampOn, setIsLampOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const handleToggleLamp = () => {
    setIsPulling(true);
    setTimeout(() => setIsPulling(false), 300);
    setIsLampOn((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleLamp();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        router.push(redirectTarget);
      } else if (data.requiresVerification) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        setErrorMessage(data.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isLampOn
          ? 'linear-gradient(135deg, #0A1128 0%, #1B2A4A 60%, #0F172A 100%)'
          : '#03060E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.8s ease',
      }}
    >
      {/* Dark Ambient Overlay when Lamp is OFF */}
      <motion.div
        animate={{ opacity: isLampOn ? 0 : 0.96 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 160px, rgba(245, 208, 97, 0.05) 0%, rgba(3, 6, 14, 0.99) 75%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── LAMP FIXTURE & PULL CORD CONTAINER ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── 3D DESIGNED BRASS PENDANT LAMP FIXTURE ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '1rem',
            zIndex: 10,
            filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.65))',
          }}
        >
          {/* Ceiling Mount Canopy & Rod */}
          <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, #1E293B, #C9943A)' }} />

          {/* Brass Fixture Top Ring */}
          <div
            style={{
              width: '32px',
              height: '10px',
              background: 'linear-gradient(135deg, #FFF0C2, #C9943A, #855214)',
              borderRadius: '4px 4px 1px 1px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          />

          {/* Brass Dome Lamp Shade */}
          <div
            style={{
              width: '160px',
              height: '52px',
              background: isLampOn
                ? 'linear-gradient(180deg, #F5D061 0%, #C9943A 40%, #A8732A 100%)'
                : 'linear-gradient(180deg, #475569 0%, #334155 40%, #1E293B 100%)',
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              transition: 'background 0.5s ease',
              boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.3)',
            }}
          >
            {/* Metallic Polish Highlight Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                width: '30%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Brass Bottom Rim Trim */}
          <div
            style={{
              width: '164px',
              height: '6px',
              background: isLampOn
                ? 'linear-gradient(90deg, #A8732A, #FFF0C2, #C9943A, #A8732A)'
                : 'linear-gradient(90deg, #1E293B, #64748B, #1E293B)',
              borderRadius: '3px',
              marginTop: '-1px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              transition: 'background 0.5s ease',
            }}
          />

          {/* 💡 Distinct Glowing Bulb (Warm Ambient core even when OFF) */}
          <motion.div
            animate={
              isLampOn
                ? shouldReduceMotion
                  ? { scale: 1, opacity: 1 }
                  : { scale: [0.85, 1.25, 1], opacity: 1 }
                : { scale: 0.92, opacity: 0.7 }
            }
            transition={{ duration: 0.4 }}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: isLampOn
                ? 'radial-gradient(circle, #FFFFFF 30%, #FFF0C2 70%, #F5D061 100%)'
                : 'radial-gradient(circle, #F5D061 20%, #C9943A 60%, #475569 100%)',
              boxShadow: isLampOn
                ? '0 0 45px 15px rgba(245, 208, 97, 0.95), 0 0 90px 30px rgba(201, 148, 58, 0.7)'
                : '0 0 16px 3px rgba(245, 208, 97, 0.35)',
              marginTop: '-13px',
              zIndex: 12,
              border: isLampOn ? '2px solid #FFFFFF' : '1.5px solid rgba(245, 208, 97, 0.5)',
              transition: 'background 0.5s ease, box-shadow 0.5s ease',
            }}
          />

          {/* ── BEADED BRASS PULL CHAIN & ACORN HANDLE ── */}
          <motion.div
            role="button"
            tabIndex={0}
            aria-label={isLampOn ? 'Turn off lamp switch' : 'Turn on lamp switch'}
            onClick={handleToggleLamp}
            onKeyDown={handleKeyDown}
            animate={{ y: isPulling ? 18 : 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            style={{
              position: 'absolute',
              top: '48px',
              right: '-16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              outline: 'none',
              zIndex: 25,
              padding: '6px',
            }}
          >
            {/* Beaded Chain (Series of Metallic Brass Balls) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFF0C2, #C9943A)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  }}
                />
              ))}
            </div>

            {/* Weighted Brass Acorn Pull Handle */}
            <div
              style={{
                width: '18px',
                height: '28px',
                borderRadius: '8px 8px 14px 14px',
                background: 'linear-gradient(135deg, #FFF0C2 0%, #F5D061 40%, #A8732A 100%)',
                boxShadow: isLampOn
                  ? '0 0 16px rgba(245, 208, 97, 0.9), 0 6px 14px rgba(0,0,0,0.6)'
                  : '0 6px 14px rgba(0,0,0,0.7)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                marginTop: '2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                position: 'relative',
              }}
            >
              {/* Engraved Accent Ring */}
              <div style={{ width: '12px', height: '2px', background: 'rgba(120, 53, 15, 0.6)', borderRadius: '1px' }} />
              <div style={{ width: '8px', height: '2px', background: 'rgba(120, 53, 15, 0.4)', borderRadius: '1px' }} />
            </div>

            {/* Side Instruction Tooltip (Attached to Cord Knob — Zero Overlap!) */}
            <motion.div
              animate={{
                opacity: isLampOn ? 0.7 : 1,
                x: isLampOn ? 0 : [0, 4, 0],
              }}
              transition={{ repeat: isLampOn ? 0 : Infinity, duration: 2 }}
              style={{
                position: 'absolute',
                left: '28px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: isLampOn
                  ? 'rgba(15, 23, 42, 0.85)'
                  : 'linear-gradient(135deg, #D04A0C 0%, #9A3412 100%)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                padding: '0.3rem 0.7rem',
                borderRadius: '8px',
                border: isLampOn ? '1px solid rgba(245,208,97,0.3)' : '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Lightbulb size={12} color="#F5D061" />
              <span>{isLampOn ? 'PULL TO OFF' : 'PULL TO ILLUMINATE'}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Dynamic Light Cone Beam (Expands from Shade Rim when lamp is ON) */}
        {!shouldReduceMotion && (
          <motion.div
            animate={{
              scaleY: isLampOn ? 1 : 0,
              opacity: isLampOn ? 0.9 : 0,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
              width: '100%',
              height: '260px',
              transformOrigin: 'top center',
              clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)',
              backgroundImage: 'linear-gradient(180deg, rgba(245, 208, 97, 0.5) 0%, rgba(201, 148, 58, 0.14) 60%, transparent 100%)',
              marginBottom: '-260px',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        )}

        {/* Ambient Warm Golden Halo behind Card */}
        <motion.div
          animate={{
            opacity: isLampOn ? 1 : 0,
            scale: isLampOn ? 1.05 : 0.5,
          }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'absolute',
            top: '50px',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,208,97,0.24) 0%, rgba(201,148,58,0.08) 50%, transparent 75%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ── ILLUMINATED LOGIN CARD (Illuminated & interactive ONLY when lamp is ON) ── */}
        <motion.div
          animate={
            isLampOn
              ? { opacity: 1, y: 0, scale: 1, display: 'block' }
              : { opacity: 0, y: 40, scale: 0.93, transitionEnd: { display: 'none' } }
          }
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.65,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.45), 0 0 30px rgba(245, 208, 97, 0.25)',
            border: '1.5px solid rgba(245, 208, 97, 0.45)',
            position: 'relative',
            zIndex: 4,
            pointerEvents: isLampOn ? 'auto' : 'none',
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
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
              Log in to access your BIS compliance assistant
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="rajesh@company.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isLampOn}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                    fontSize: '0.92rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isLampOn}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.8rem 0.75rem 2.8rem',
                    fontSize: '0.92rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isLampOn}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !isLampOn}
              whileHover={isLampOn ? { scale: 1.02 } : {}}
              whileTap={isLampOn ? { scale: 0.98 } : {}}
              style={{
                marginTop: '0.5rem',
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
                transition: 'background 0.2s',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: '1.8rem', textAlign: 'center', fontSize: '0.88rem', color: '#64748B' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#1B2A4A', fontWeight: 700, textDecoration: 'underline' }}>
              Sign Up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#0A1128', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
