'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../../lib/authContext';

export default function BrokerLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(demoEmail, 'Password123!');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070d15',
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(20, 34, 54, 0.7) 0%, #070d15 70%)`,
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0d1624',
          border: '1px solid rgba(198, 167, 106, 0.3)',
          borderRadius: '2px',
          padding: '3rem 2.5rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(198, 167, 106, 0.12)',
              border: '1px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--color-gold)',
            }}
          >
            <Lock size={24} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem',
              letterSpacing: '0.15em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            AURELIA <span style={{ color: 'var(--color-gold)' }}>&</span> CO.
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              marginTop: '0.25rem',
              fontWeight: 600,
            }}
          >
            Internal Brokerage Terminal
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '2px',
              fontSize: '0.825rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Broker / Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alexander.vance@aureliatravel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="luxury-input"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Security Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="luxury-input"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold"
            style={{ width: '100%', marginTop: '0.75rem', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Verifying Session...' : 'Authenticate Terminal'} <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Shortcut Buttons for Testing */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', textAlign: 'center' }}>
            Instant Testing Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('alexander.vance@aureliatravel.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: '#142236',
                border: '1px solid rgba(198, 167, 106, 0.2)',
                borderRadius: '2px',
                color: '#f7f5f0',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Alexander Vance (Admin)</span>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Managing Director & Aviation Lead</div>
              </div>
              <span className="badge-navy" style={{ fontSize: '0.65rem' }}>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('elena.rostova@aureliatravel.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: '#142236',
                border: '1px solid rgba(198, 167, 106, 0.2)',
                borderRadius: '2px',
                color: '#f7f5f0',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Elena Rostova (Broker)</span>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Senior Superyacht Charter Broker</div>
              </div>
              <span className="badge-navy" style={{ fontSize: '0.65rem' }}>Sign In</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <a href="/" style={{ fontSize: '0.75rem', color: '#64748b' }}>
            &larr; Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}

