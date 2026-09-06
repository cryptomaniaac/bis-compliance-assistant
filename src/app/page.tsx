'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ShieldCheck, BookOpen, ArrowRight, Zap, FileText, Database, Star, Sparkles, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import DepthBackground from '@/components/DepthBackground';
import ScrollProgress from '@/components/ScrollProgress';
import HowItWorksPinned from '@/components/HowItWorksPinned';
import SmoothScroll from '@/components/SmoothScroll';
import SpotlightFeatureCard from '@/components/SpotlightFeatureCard';
import EmblemFallback from '@/components/EmblemFallback';

const Hero3DCanvas = dynamic(() => import('@/components/Hero3DCanvas'), {
  loading: () => <EmblemFallback />,
  ssr: false,
});

const EXAMPLE_QUERIES = [
  { title: 'Electric Kettle', query: 'I am launching an electric kettle for kitchen use', code: 'IS 302-2-201' },
  { title: 'LED Bulbs', query: 'I manufacture LED bulbs and lighting products', code: 'IS 16102' },
  { title: 'Children Toys', query: 'I make plastic and plush toys for children', code: 'IS 9873' },
  { title: 'Packaged Water', query: 'I manufacture packaged drinking water', code: 'IS 14543' },
];

const FEATURES = [
  {
    icon: <ShieldCheck size={28} color="#F5D061" />,
    title: 'Zero Hallucination Retrieval',
    desc: 'Every IS code, Quality Control Order (QCO), and lab testing requirement is strictly retrieved from indexed official BIS Gazette notifications via RAG — zero fake rules or hallucinated standards.',
  },
  {
    icon: <Database size={28} color="#C9943A" />,
    title: 'Supabase + pgvector Search',
    desc: 'High-performance vector embeddings (cosine similarity search) index thousands of Indian Technical Specifications with sub-second retrieval latency.',
  },
  {
    icon: <FileText size={28} color="#C1440E" />,
    title: 'Structured Action Roadmaps',
    desc: 'Get an instant, actionable breakdown: Scheme I (ISI Mark) vs Scheme II (CRS) registration route, mandatory NABL lab parameters, and step-by-step launch checklist.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [statCounts, setStatCounts] = useState({ standards: 0, latency: 0 });
  const [statsCompleted, setStatsCompleted] = useState(false);

  const heroSectionRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const trustBarRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

  // ── GSAP HERO EXIT CAMERA PULL-BACK ──
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(min-width: 768px)': function () {
          if (heroSectionRef.current && heroContentRef.current) {
            gsap.to(heroContentRef.current, {
              scale: 0.88,
              opacity: 0.35,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: heroSectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.5,
              },
            });
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // ── CountUp Animation for Trust Bar ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const interval = setInterval(() => {
            start += 1;
            setStatCounts({
              standards: Math.min(29, start),
              latency: Math.min(950, start * 32),
            });
            if (start >= 29) {
              clearInterval(interval);
              setStatsCompleted(true);
            }
          }, 25);
        }
      },
      { threshold: 0.2 }
    );

    if (trustBarRef.current) observer.observe(trustBarRef.current);
    return () => observer.disconnect();
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.215, 0.61, 0.355, 1] as const } },
  };

  return (
    <SmoothScroll>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          background: 'linear-gradient(180deg, #060D1F 0%, #03060D 40%, #0A1128 100%)',
          minHeight: '100vh',
        }}
      >
        {/* ── Top Scroll Progress Bar ── */}
        <ScrollProgress />

        {/* ══════════════════════════════════════════════════
            1. HERO — Framer Motion Staggered Entrance & GSAP Exit
            ══════════════════════════════════════════════════ */}
        <section
          ref={heroSectionRef}
          style={{
            color: 'white',
            padding: '6rem 2rem 6.5rem',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #060D1F 0%, #0A1128 70%, #162347 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Canvas Constellation Background */}
          <DepthBackground />

          <div
            ref={heroContentRef}
            style={{
              maxWidth: '1240px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              willChange: 'transform, opacity',
            }}
          >
            {/* LEFT — Staggered Entrance Copy (framer-motion) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}
            >
              {/* Item 1: Badge */}
              <motion.div variants={itemVariants}>
                <div
                  className="seal-stamp-gold"
                  style={{ fontSize: '0.8rem', padding: '0.38rem 1rem', boxShadow: '0 4px 20px rgba(245,208,97,0.28)', display: 'inline-flex' }}
                >
                  <ShieldCheck size={16} />
                  <span>OFFICIAL INDIAN STANDARDS &amp; COMPLIANCE PORTAL</span>
                </div>
              </motion.div>

              {/* Item 2: Headline & Subtext */}
              <motion.div variants={itemVariants}>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.8rem, 5.2vw, 4.4rem)',
                    fontWeight: 800,
                    lineHeight: '1.08',
                    letterSpacing: '-0.035em',
                    color: '#FFFFFF',
                  }}
                >
                  Know exactly what{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #FFF0C2 0%, #F5D061 50%, #C9943A 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 2px 12px rgba(201,148,58,0.35))',
                    }}
                  >
                    BIS certification
                  </span>{' '}
                  your product needs.
                </h1>
                <p
                  style={{
                    fontSize: '1.15rem',
                    color: 'rgba(195, 210, 230, 0.9)',
                    maxWidth: '620px',
                    lineHeight: '1.65',
                    fontWeight: 400,
                    marginTop: '1.2rem',
                  }}
                >
                  Describe your product in plain language or scan it with your camera. Get applicable IS Codes, certification pathways (ISI Mark vs CRS), mandatory lab testing rules, and an action roadmap — instantly.
                </p>
              </motion.div>

              {/* Item 3: Action Buttons with Framer Motion Hover Lift */}
              <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/chat"
                    className="btn-primary"
                    style={{ padding: '1.05rem 2.4rem', fontSize: '1.05rem', boxShadow: '0 8px 30px rgba(208,74,12,0.5)', display: 'inline-flex' }}
                  >
                    <Zap size={19} strokeWidth={2.5} />
                    <span>Launch AI Consultant</span>
                    <ArrowRight size={17} />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/browse"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      padding: '1.05rem 2rem',
                      borderRadius: 'var(--r-md)',
                      fontWeight: 600,
                      fontSize: '1.02rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      textDecoration: 'none',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <BookOpen size={18} />
                    <span>Browse Standards Index</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Item 4: Example Chips */}
              <motion.div variants={itemVariants}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(148,163,184,0.85)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Sparkles size={14} color="#F5D061" /> Try an example query:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {EXAMPLE_QUERIES.map((chip, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                      onClick={() => router.push(`/chat?prompt=${encodeURIComponent(chip.query)}`)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        color: 'rgba(255,255,255,0.92)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--r-full)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                      }}
                    >
                      <span className="standard-code-badge" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem', background: 'rgba(0,0,0,0.45)' }}>
                        {chip.code}
                      </span>
                      {chip.title}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT — 3D Shield Canvas */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                height: '380px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hero3DCanvas />
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            2. TRUST BAR — framer-motion whileInView
            ══════════════════════════════════════════════════ */}
        <section ref={trustBarRef} style={{ maxWidth: '1240px', margin: '3.5rem auto 0', width: '92%', position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 35, 71, 0.98) 0%, rgba(10, 17, 40, 0.99) 100%)',
              borderRadius: '24px',
              padding: '2.5rem 3rem',
              boxShadow: '0 28px 64px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
              border: '1.5px solid rgba(245,208,97,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.8rem',
            }}
          >
            {/* Header Line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="#F5D061" />
                <span style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F5D061', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  GROUNDED IN OFFICIAL BIS REGULATORY DATA
                </span>
              </div>
              <a
                href="https://bis.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'rgba(195,210,230,0.85)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                className="hover:underline"
              >
                <span>Verify at bis.gov.in</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* 3 Stat Callouts */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '2rem',
                textAlign: 'center',
              }}
            >
              {/* Stat 1 */}
              <div style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  style={{
                    fontSize: '3rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: '#F5D061',
                    lineHeight: 1,
                    transform: statsCompleted ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {statCounts.standards}+
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
                  Indian Standards Indexed
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(195, 210, 230, 0.75)', marginTop: '0.2rem' }}>
                  Electrical, LED, Toys, Steel, Water &amp; Batteries
                </div>
              </div>

              {/* Stat 2 */}
              <div style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#C9943A', lineHeight: 1 }}>
                  Zero
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
                  Hallucination RAG Search
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(195, 210, 230, 0.75)', marginTop: '0.2rem' }}>
                  Strict vector cosine similarity grounding
                </div>
              </div>

              {/* Stat 3 */}
              <div style={{ padding: '1rem' }}>
                <div
                  style={{
                    fontSize: '3rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: '#C1440E',
                    lineHeight: 1,
                    transform: statsCompleted ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  &lt;{statCounts.latency}ms
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
                  Retrieval Latency
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(195, 210, 230, 0.75)', marginTop: '0.2rem' }}>
                  Supabase + pgvector database index
                </div>
              </div>
            </div>

            {/* Credibility Line */}
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                🚀 <strong>Built for SIH26107</strong> — Grounded directly against official Bureau of Indian Standards (BIS) Gazette notifications &amp; Quality Control Orders.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════
            3. HOW IT WORKS — GSAP Pinned Storytelling Sequence
            ══════════════════════════════════════════════════ */}
        <section style={{ marginTop: '5rem', width: '100%' }}>
          <HowItWorksPinned />
        </section>

        {/* ══════════════════════════════════════════════════
            4. FEATURE HIGHLIGHTS — framer-motion whileInView
            ══════════════════════════════════════════════════ */}
        <section style={{ maxWidth: '1240px', margin: '6rem auto 0', width: '92%' }}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#C9943A',
                background: 'rgba(201,148,58,0.1)',
                border: '1px solid rgba(201,148,58,0.25)',
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                marginBottom: '1rem',
              }}
            >
              <Zap size={14} />
              <span>ENTERPRISE COMPLIANCE ARCHITECTURE</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Built for speed, accuracy, and absolute trust.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <SpotlightFeatureCard icon={feat.icon} title={feat.title} desc={feat.desc} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            5. FINAL CTA & INTEGRATED FOOTER — framer-motion whileInView
            ══════════════════════════════════════════════════ */}
        <section ref={ctaSectionRef} style={{ maxWidth: '1240px', margin: '7rem auto 3rem', width: '92%' }}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
              background: 'linear-gradient(135deg, #050816 0%, #162347 50%, #0A1128 100%)',
              borderRadius: '28px',
              padding: '4.8rem 3rem 3rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              border: '1.5px solid rgba(245,208,97,0.4)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <DepthBackground />

            {/* Glowing Aura Behind Button */}
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 208, 97, 0.35) 0%, transparent 70%)',
                filter: 'blur(35px)',
                pointerEvents: 'none',
              }}
            />

            {/* CTA Header */}
            <div className="seal-stamp-gold" style={{ fontSize: '0.8rem', padding: '0.38rem 1rem', position: 'relative', zIndex: 2 }}>
              <Star size={14} />
              <span>OFFICIAL HACKATHON DEMO · SIH26107</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                maxWidth: '720px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              Ready to check your product compliance?
            </h2>

            <p style={{ fontSize: '1.1rem', color: 'rgba(195,210,230,0.88)', maxWidth: '580px', lineHeight: '1.65', position: 'relative', zIndex: 2 }}>
              Stop wading through dense PDF government manuals. Get instant, grounded compliance answers from official Indian Standards.
            </p>

            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href="/chat"
                className="btn-primary"
                style={{
                  padding: '1.1rem 2.8rem',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 30px rgba(208,74,12,0.6)',
                  position: 'relative',
                  zIndex: 2,
                  display: 'inline-flex',
                }}
              >
                <Zap size={20} strokeWidth={2.5} />
                <span>Launch AI Consultant</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Divider */}
            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0 1rem', position: 'relative', zIndex: 2 }} />

            {/* Folded-In Integrated Footer */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                textAlign: 'left',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Brand & Tagline */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  <ShieldCheck size={20} color="#F5D061" />
                  <span>BIS Assist</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(195,210,230,0.65)', marginTop: '0.25rem' }}>
                  Grounded Indian Standards &amp; BIS Quality Control Compliance Guide
                </p>
              </div>

              {/* Navigation Links */}
              <div style={{ display: 'flex', gap: '1.8rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <Link href="/chat" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} className="hover:underline">
                  AI Chatbot
                </Link>
                <Link href="/browse" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} className="hover:underline">
                  Browse Standards
                </Link>
                <Link href="/about" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} className="hover:underline">
                  About
                </Link>
              </div>

              {/* Hackathon Badge */}
              <div style={{ fontSize: '0.78rem', color: '#F5D061', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                SIH HACKATHON PROJECT · SIH26107
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </SmoothScroll>
  );
}
