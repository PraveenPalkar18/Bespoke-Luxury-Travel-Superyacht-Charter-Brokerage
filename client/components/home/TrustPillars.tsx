'use client';

import React from 'react';
import { Shield, Users, Award, Clock } from 'lucide-react';

export default function TrustPillars() {
  return (
    <section className="section-spacing">
      <div className="container-luxury">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
          <div className="gold-label">Uncompromising Standards</div>
          <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
            The Brokerage Difference
          </h2>
          <div className="gold-divider center" />
        </div>

        <div className="grid-4">
          <div
            style={{
              background: '#142236',
              padding: '2.5rem 1.75rem',
              border: '1px solid rgba(198, 167, 106, 0.18)',
              borderRadius: '2px',
            }}
          >
            <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              <Shield size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Vetted Global Fleet
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7' }}>
              Every aircraft and yacht meets rigorous Wyvern Wingman, ARG/US Platinum, and MYBA charter compliance standards.
            </p>
          </div>

          <div
            style={{
              background: '#142236',
              padding: '2.5rem 1.75rem',
              border: '1px solid rgba(198, 167, 106, 0.18)',
              borderRadius: '2px',
            }}
          >
            <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              <Users size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Senior Broker Lead
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7' }}>
              No call centers. You work directly with an experienced charter director with direct owner and operator authority.
            </p>
          </div>

          <div
            style={{
              background: '#142236',
              padding: '2.5rem 1.75rem',
              border: '1px solid rgba(198, 167, 106, 0.18)',
              borderRadius: '2px',
            }}
          >
            <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              <Award size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Total Discretion
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7' }}>
              Complete confidentiality protocols, non-disclosure agreements, and anonymous flight manifests for high-profile principals.
            </p>
          </div>

          <div
            style={{
              background: '#142236',
              padding: '2.5rem 1.75rem',
              border: '1px solid rgba(198, 167, 106, 0.18)',
              borderRadius: '2px',
            }}
          >
            <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              2-Hour Response
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7' }}>
              Dedicated 24/7 global operations desks in Monaco, London, New York, and Dubai ready for short-notice departures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

