'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { IYacht } from '../../types';

interface YachtShowcaseProps {
  yachts: IYacht[];
}

export default function YachtShowcase({ yachts }: YachtShowcaseProps) {
  return (
    <section className="section-spacing" style={{ backgroundColor: '#0d1724' }}>
      <div className="container-luxury">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="gold-label">Charter Flagships</div>
            <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
              Superyacht Collection
            </h2>
          </div>
          <a href="/yachts" className="btn-outline-gold" style={{ fontSize: '0.78rem' }}>
            View Entire Collection <ChevronRight size={15} />
          </a>
        </div>

        <div className="grid-3">
          {yachts.map((yacht) => (
            <div key={yacht._id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: '240px',
                  backgroundImage: `url(${yacht.featuredImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <span
                  className="badge-gold"
                  style={{ position: 'absolute', top: '1rem', left: '1rem' }}
                >
                  {yacht.length}m / {yacht.lengthFeet}ft
                </span>
                <span
                  className="badge-navy"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(9, 16, 26, 0.85)' }}
                >
                  {yacht.builder}
                </span>
              </div>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {yacht.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  {yacht.regions.join(' • ')}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {yacht.editorialSummary}
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
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Guests</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.guestCapacity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Cabins</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.cabins} Staterooms</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Crew</div>
                    <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.crew} Officers</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a href={`/yachts/${yacht._id}`} className="btn-outline-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                    Dossier
                  </a>
                  <a href={`/plan?yacht=${yacht._id}`} className="btn-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                    Charter
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

