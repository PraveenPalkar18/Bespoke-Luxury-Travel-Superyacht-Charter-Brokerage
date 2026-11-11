'use client';

import React from 'react';

export default function BrandIntroduction() {
  return (
    <section className="section-spacing" style={{ backgroundColor: '#0d1724' }}>
      <div className="container-luxury">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
              The Aurelia Brokerage Standard
            </div>
            <h2 className="heading-editorial" style={{ marginBottom: '1.5rem', color: '#ffffff' }}>
              Crafted for those who view the world without borders.
            </h2>
            <div className="gold-divider" />
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.25rem' }}>
              Headquartered in Monaco with brokerage presence in London Mayfair, New York, and Dubai, Aurelia & Co. orchestrates seamless transcontinental journeys.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              Whether arranging a runway-tarmac transfer from a Gulfstream G700 to an 85-meter Lürssen superyacht berthed at Port Hercule, our dedicated charter directors personally oversee every nautical mile and nautical flight hour.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem' }}>Zero Compromise</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Every asset inspected to ARG/US Platinum and MYBA standards.</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem' }}>Single Touchpoint</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>A senior charter director personally manages your travel dossier.</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: '460px',
                borderRadius: '2px',
                backgroundImage: `url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(198, 167, 106, 0.3)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '-25px',
                background: '#142236',
                padding: '1.5rem 2rem',
                border: '1px solid rgba(198, 167, 106, 0.35)',
                borderRadius: '2px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                maxWidth: '280px',
              }}
            >
              <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                Client Discretion
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#ffffff', marginTop: '0.35rem' }}>
                &ldquo;A level of precision and privacy rarely encountered in modern aviation.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

