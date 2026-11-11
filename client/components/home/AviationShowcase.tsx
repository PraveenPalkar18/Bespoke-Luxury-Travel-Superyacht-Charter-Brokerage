'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { IAircraft } from '../../types';

interface AviationShowcaseProps {
  jets: IAircraft[];
}

export default function AviationShowcase({ jets }: AviationShowcaseProps) {
  return (
    <section className="section-spacing">
      <div className="container-luxury">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="gold-label">Global Flight Department</div>
            <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
              Private Jet Portfolio
            </h2>
          </div>
          <a href="/jets" className="btn-outline-gold" style={{ fontSize: '0.78rem' }}>
            View Entire Fleet ({jets.length > 0 ? `${jets.length}+ Aircraft` : 'Explore'}) <ChevronRight size={15} />
          </a>
        </div>

        <div className="grid-3">
          {jets.map((aircraft) => (
            <div key={aircraft._id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: '240px',
                  backgroundImage: `url(${aircraft.featuredImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <span
                  className="badge-gold"
                  style={{ position: 'absolute', top: '1rem', left: '1rem' }}
                >
                  {aircraft.category}
                </span>
              </div>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {aircraft.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  {aircraft.model}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {aircraft.editorialSummary}
                </p>

                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Range</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{aircraft.range} nm</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Guests</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>Up to {aircraft.passengerCapacity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Speed</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{aircraft.cruiseSpeed} kts</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a href={`/jets/${aircraft._id}`} className="btn-outline-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                    Specifications
                  </a>
                  <a href={`/plan?aircraft=${aircraft._id}`} className="btn-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                    Enquire
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

