'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../lib/authContext';

export default function BrokerLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setErrorMessage(err.message || 'Invalid email or password credentials.');
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
              placeholder="name@aureliatravel.com"
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input"
                style={{ fontSize: '0.9rem', width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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

        <div style={{ textAlign: 'center', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <a href="/" style={{ fontSize: '0.75rem', color: '#64748b' }}>
            &larr; Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
