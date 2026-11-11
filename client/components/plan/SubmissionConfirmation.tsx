'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SubmissionConfirmationProps {
  referenceCode: string;
  customerName: string;
  destination: string;
}

export default function SubmissionConfirmation({
  referenceCode,
  customerName,
  destination,
}: SubmissionConfirmationProps) {
  return (
    <div
      style={{
        background: '#101c2c',
        border: '1px solid rgba(198, 167, 106, 0.4)',
        borderRadius: '2px',
        padding: '4rem 2.5rem',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(198, 167, 106, 0.15)',
          border: '1px solid var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: 'var(--color-gold)',
        }}
      >
        <CheckCircle2 size={38} />
      </div>

      <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
        Charter Dossier Logged
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#ffffff', marginBottom: '1rem' }}>
        Enquiry Successfully Transmitted
      </h2>
      <div className="gold-divider center" />

      <div
        style={{
          background: '#0a121e',
          padding: '1.25rem 2rem',
          border: '1px solid rgba(198, 167, 106, 0.25)',
          display: 'inline-block',
          margin: '1.5rem 0',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Charter Reference Number
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>
          {referenceCode}
        </div>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '620px', margin: '0 auto 2.5rem auto' }}>
        Thank you, <strong style={{ color: '#ffffff' }}>{customerName}</strong>. Your requirements for{' '}
        <strong style={{ color: '#ffffff' }}>{destination}</strong> have been securely routed to our Monaco & London Charter Desks.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left',
          background: '#142236',
          padding: '1.75rem',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Assigned Director</div>
          <div style={{ color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>Alexander Vance & Elena Rostova</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>Senior Partner Desk</div>
        </div>
        <div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Direct Response Line</div>
          <div style={{ color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>+377 98 06 20 00</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>charters@aureliatravel.com</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a href="/" className="btn-outline-gold" style={{ fontSize: '0.8rem' }}>
          Return to Homepage
        </a>
        <a href="/dashboard/login" className="btn-gold" style={{ fontSize: '0.8rem' }}>
          Broker Portal Sign-In
        </a>
      </div>
    </div>
  );
}

