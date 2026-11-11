'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Plane,
  Anchor,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  User,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const isLoginPage = pathname === '/dashboard/login';

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/dashboard/login');
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070d15',
          color: 'var(--color-gold)',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
        }}
      >
        Initializing Secure Terminal...
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={17} /> },
    { name: 'Enquiries Pipeline', href: '/dashboard/enquiries', icon: <Inbox size={17} /> },
    { name: 'Catalogue & Fleet', href: '/dashboard/catalogue', icon: <Layers size={17} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070d15', color: '#f7f5f0', display: 'flex', flexDirection: 'column' }}>
      {/* Top Broker Header */}
      <header
        style={{
          backgroundColor: '#0a121e',
          borderBottom: '1px solid rgba(198, 167, 106, 0.25)',
          padding: '0.85rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.3rem',
                letterSpacing: '0.15em',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              AURELIA <span style={{ color: 'var(--color-gold)' }}>&</span> CO.
            </span>
            <span
              className="badge-gold"
              style={{ fontSize: '0.625rem', padding: '0.15rem 0.45rem', letterSpacing: '0.1em' }}
            >
              BROKER OPS
            </span>
          </a>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: '2px',
                    color: isActive ? 'var(--color-gold)' : '#cbd5e1',
                    background: isActive ? 'rgba(198, 167, 106, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(198, 167, 106, 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.icon}
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: '#94a3b8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Public Site <ExternalLink size={13} />
          </a>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingLeft: '1.25rem',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase' }}>
                {user.role === 'admin' ? 'Administrator' : 'Senior Broker'}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/dashboard/login');
              }}
              title="End Broker Session"
              style={{
                background: '#142236',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                padding: '0.5rem 0.65rem',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main style={{ flex: 1, padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  );
}

