'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section
      style={{
        padding: '6rem 1.5rem',
        backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.88), rgba(9, 16, 26, 0.88)), url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        borderTop: '1px solid rgba(198, 167, 106, 0.25)',
        borderBottom: '1px solid rgba(198, 167, 106, 0.25)',
      }}
    >
      <div className="container-narrow">
        <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
          Commission Your Journey
        </div>
        <h2 className="heading-editorial" style={{ marginBottom: '1.25rem', color: '#ffffff' }}>
          Ready to experience travel without boundary?
        </h2>
        <div className="gold-divider center" />
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Our charter directors are at your service to craft bespoke aviation routings, superyacht voyages, and exclusive resort stays.
        </p>
        <a href="/plan" className="btn-gold" style={{ padding: '1.15rem 2.8rem', fontSize: '0.875rem' }}>
          Begin Consultation <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

