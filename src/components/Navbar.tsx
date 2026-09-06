'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, MessageSquare, BookOpen, Info, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Fetch authenticated user profile
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (e) {}
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link href="/" className="brand-logo">
        <div className="shield-icon">
          <ShieldCheck size={18} strokeWidth={2.5} />
        </div>
        <span>BIS Assist</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.05em',
          marginLeft: '-0.1rem',
          alignSelf: 'flex-end',
          marginBottom: '1px',
        }}>
          SIH
        </span>
      </Link>

      {/* Nav links */}
      <ul className="nav-links">
        <li>
          <Link
            href="/chat"
            className={`nav-link ${pathname === '/chat' ? 'active' : ''}`}
          >
            <MessageSquare size={15} strokeWidth={2} />
            <span>AI Chatbot</span>
            {pathname === '/chat' && (
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10B981', display: 'inline-block',
                boxShadow: '0 0 6px rgba(16,185,129,0.6)',
                animation: 'pulseDot 1.4s infinite',
              }} />
            )}
          </Link>
        </li>
        <li>
          <Link
            href="/browse"
            className={`nav-link ${pathname === '/browse' ? 'active' : ''}`}
          >
            <BookOpen size={15} strokeWidth={2} />
            <span>Browse Standards</span>
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={`nav-link ${pathname === '/about' ? 'active' : ''}`}
          >
            <Info size={15} strokeWidth={2} />
            <span>About</span>
          </Link>
        </li>
      </ul>

      {/* Auth Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              title={user.email}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <User size={14} color="#C9943A" />
              <span>{user.name.split(' ')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.8)',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              href="/login"
              style={{
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
            >
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
