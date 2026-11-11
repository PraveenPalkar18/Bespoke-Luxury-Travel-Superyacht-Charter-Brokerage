'use client';

import React from 'react';
import { Shield, Award, Users, Anchor, Plane, MapPin, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            Heritage & Distinction
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            About Aurelia & Co.
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Founded in the Principality of Monaco, Aurelia & Co. represents the gold standard in private aviation advisory, superyacht charter brokerage, and bespoke global travel management.
          </p>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className="section-spacing">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Our Heritage
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
                A Sovereign Approach to Modern Mobility
              </h2>
              <div className="gold-divider" />
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Aurelia & Co. was established with a singular objective: to provide ultra-high-net-worth individuals, royalty, and corporate executives with a level of charter precision, asset vetting, and discretion unmatched by traditional travel agencies.
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                We maintain direct relationships with leading aircraft operators and shipyard management desks globally. This allows us to secure preferred pricing, guarantee priority aircraft positioning, and unlock prime berths at Port Hercule, Gustavia, and Dubai Marina.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ borderLeft: '2px solid var(--color-gold)', paddingLeft: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>24 / 7</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Global Duty Desk</div>
                </div>
                <div style={{ borderLeft: '2px solid var(--color-gold)', paddingLeft: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>100%</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Discretion & NDA Compliance</div>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  height: '460px',
                  borderRadius: '2px',
                  backgroundImage: `url('https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=85')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid rgba(198, 167, 106, 0.3)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="section-spacing" style={{ backgroundColor: '#0d1724' }}>
        <div className="container-luxury">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
            <div className="gold-label">Global Presence</div>
            <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
              Brokerage Hubs Worldwide
            </h2>
            <div className="gold-divider center" />
          </div>

          <div className="grid-4">
            <div style={{ background: '#101c2c', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Monaco</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>World Headquarters</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                27 Boulevard Albert 1er, Port Hercule, MC 98000
              </p>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginTop: '1rem' }}>+377 98 06 20 00</div>
            </div>

            <div style={{ background: '#101c2c', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>London Mayfair</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>UK & European Flight Ops</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                14 Berkeley Square, Mayfair, London W1J 6BQ
              </p>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginTop: '1rem' }}>+44 20 7946 0888</div>
            </div>

            <div style={{ background: '#101c2c', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>New York</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Americas Aviation Desk</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                767 Fifth Avenue, Manhattan, NY 10153
              </p>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginTop: '1rem' }}>+1 212 555 0198</div>
            </div>

            <div style={{ background: '#101c2c', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Dubai</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Middle East & Gulf Concierge</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                Gate Village 03, DIFC, Dubai, UAE
              </p>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginTop: '1rem' }}>+971 4 362 7000</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

