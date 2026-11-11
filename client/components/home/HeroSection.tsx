'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 1.5rem 5rem 1.5rem',
        backgroundImage: `linear-gradient(to bottom, rgba(9, 16, 26, 0.45) 0%, rgba(9, 16, 26, 0.85) 85%, #09101a 100%), url('https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2400&q=90')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container-narrow" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            className="badge-gold"
            style={{
              letterSpacing: '0.24em',
              padding: '0.45rem 1.25rem',
              fontSize: '0.725rem',
              backgroundColor: 'rgba(9, 16, 26, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
          >
            MONACO • LONDON • NEW YORK • DUBAI
          </span>
        </div>

        <h1
          className="heading-display"
          style={{
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px rgba(0,0,0,0.7)',
          }}
        >
          Extraordinary Journeys. <br />
          <span style={{ fontStyle: 'italic', color: '#f7f5f0' }}>Exclusively Yours.</span>
        </h1>

        <div className="gold-divider center" style={{ width: '60px', height: '2px' }} />

        <p
          className="lead-text"
          style={{
            maxWidth: '680px',
            margin: '1.5rem auto 2.5rem auto',
            color: '#d1d9e6',
            fontSize: '1.15rem',
            lineHeight: '1.7',
          }}
        >
          The world’s premier private charter brokerage. Unrivalled access to vetted ultra long-range private aviation, majestic superyacht charters, and discreet global itineraries.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a href="/plan" className="btn-gold" style={{ padding: '1.1rem 2.5rem', fontSize: '0.85rem' }}>
            Plan Your Journey <ArrowRight size={16} />
          </a>
          <a
            href="/yachts"
            className="btn-outline-gold"
            style={{
              padding: '1.1rem 2.25rem',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(9, 16, 26, 0.65)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Explore Collection
          </a>
        </div>

        {/* Quick Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            marginTop: '5rem',
            padding: '1.75rem',
            background: 'rgba(16, 28, 44, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(198, 167, 106, 0.25)',
            borderRadius: '2px',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-gold)' }}>
              1,800+
            </div>
            <div style={{ fontSize: '0.725rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Vetted Aircraft
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-gold)' }}>
              650+
            </div>
            <div style={{ fontSize: '0.725rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Charter Superyachts
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-gold)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.725rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Discretion Guaranteed
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-gold)' }}>
              24 / 7
            </div>
            <div style={{ fontSize: '0.725rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Dedicated Charter Desk
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

