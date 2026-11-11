'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ExperiencesShowcase() {
  return (
    <section className="section-spacing" style={{ backgroundColor: '#0d1724' }}>
      <div className="container-luxury">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div className="gold-label">Beyond The Ordinary</div>
            <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
              Bespoke Expeditions & VIP Access
            </h2>
            <div className="gold-divider" />
            <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Chartering with Aurelia extends beyond transit. We unlock private atoll takeovers, front-row Port Hercule yacht berths during the Monaco Grand Prix, and deep-sea submersible marine biological expeditions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Monaco Historic & F1 Trackside Berths</div>
                  <div style={{ color: '#64748b', fontSize: '0.825rem' }}>Guaranteed prime moorings along Quay Kennedy and Port Hercule chicane.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Private Sandbank Dinners in Baa Atoll</div>
                  <div style={{ color: '#64748b', fontSize: '0.825rem' }}>Tendered chef service under starlit equatorial constellations.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Heli-Skiing via Superyacht Helipad</div>
                  <div style={{ color: '#64748b', fontSize: '0.825rem' }}>Arctic fjord drop-offs directly from your certified touch-and-go deck.</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <a href="/experiences" className="btn-outline-gold">
                Discover All Experiences
              </a>
            </div>
          </div>

          <div>
            <div
              style={{
                height: '480px',
                borderRadius: '2px',
                backgroundImage: `url('https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85')`,
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
  );
}

