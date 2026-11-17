'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Lock, CheckCircle2, XCircle, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { fetchInvitationDetails, acceptInvitationApi } from '../../../lib/api';

export default function BrokerInviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<{
    email: string;
    name: string;
    title?: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      if (!token) return;
      try {
        const data = await fetchInvitationDetails(token);
        setInviteData(data);
      } catch (err: any) {
        setError(err.message || 'The invitation link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [token]);

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;
  const isFormValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await acceptInvitationApi(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to complete broker onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070d15', color: 'var(--color-gold)' }}>
        Verifying Secure Invitation Token...
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070d15', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#0d1624', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={28} />
          </div>
          <div className="gold-label" style={{ marginBottom: '0.5rem' }}>Invalid or Expired Link</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.6rem', marginBottom: '1rem' }}>
            Invitation Inaccessible
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {error || 'This single-use invitation token could not be verified. It may have already been used, revoked, or expired.'}
          </p>
          <a href="/dashboard/login" className="btn-gold" style={{ fontSize: '0.8rem' }}>
            Go to Broker Login
          </a>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070d15', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.3)', padding: '3.5rem 2.5rem', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={32} />
          </div>
          <div className="gold-label" style={{ marginBottom: '0.5rem' }}>Account Activated</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.8rem', marginBottom: '1rem' }}>
            Welcome to Aurelia & Co.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Your broker credentials have been successfully configured. You can now access your confidential charter pipeline.
          </p>
          <button
            onClick={() => router.push('/dashboard/login')}
            className="btn-gold"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            Access Broker Terminal <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070d15', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '520px', width: '100%', background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.3)', padding: '3rem 2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(198, 167, 106, 0.12)', border: '1px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-gold)' }}>
            <ShieldCheck size={26} />
          </div>
          <div className="gold-label" style={{ marginBottom: '0.35rem' }}>Broker Onboarding</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
            Configure Broker Credentials
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Welcome, <strong style={{ color: '#ffffff' }}>{inviteData.name}</strong>. Create your security password to activate your brokerage desk.
          </p>
        </div>

        <div style={{ background: '#142236', border: '1px solid rgba(198, 167, 106, 0.2)', padding: '1rem 1.25rem', borderRadius: '2px', marginBottom: '2rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#94a3b8' }}>Designated Email:</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{inviteData.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Operational Role:</span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{inviteData.title || 'Charter Broker'}</span>
          </div>
        </div>

        {submitError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '2px', fontSize: '0.825rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Create Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input"
                style={{ width: '100%', fontSize: '0.9rem', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="luxury-input"
              style={{ width: '100%', fontSize: '0.9rem' }}
            />
          </div>

          {/* Password Checklist */}
          <div style={{ background: '#09101a', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '2px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasMinLength ? '#4ade80' : '#64748b' }}>
              {hasMinLength ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Minimum 8 characters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasUppercase ? '#4ade80' : '#64748b' }}>
              {hasUppercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />} At least one uppercase letter (A-Z)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasLowercase ? '#4ade80' : '#64748b' }}>
              {hasLowercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />} At least one lowercase letter (a-z)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasNumber ? '#4ade80' : '#64748b' }}>
              {hasNumber ? <CheckCircle2 size={13} /> : <XCircle size={13} />} At least one number (0-9)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasSpecial ? '#4ade80' : '#64748b' }}>
              {hasSpecial ? <CheckCircle2 size={13} /> : <XCircle size={13} />} At least one special symbol (!@#$%^&*)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isMatch ? '#4ade80' : '#64748b' }}>
              {isMatch ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Passwords match
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="btn-gold"
            style={{ width: '100%', marginTop: '0.5rem', opacity: isFormValid && !submitting ? 1 : 0.5 }}
          >
            {submitting ? 'Activating Credentials...' : 'Complete Broker Activation'} <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
