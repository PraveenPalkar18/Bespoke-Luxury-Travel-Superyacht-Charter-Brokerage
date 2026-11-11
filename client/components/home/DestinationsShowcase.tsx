'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { IDestination } from '../../types';

interface DestinationsShowcaseProps {
  destinations: IDestination[];
}

export default function DestinationsShowcase({ destinations }: DestinationsShowcaseProps) {
  return (
    <section className="section-spacing">
      <div className="container-luxury">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
          <div className="gold-label">Iconic Waters & Playgrounds</div>
          <h2 className="heading-editorial" style={{ marginTop: '0.5rem', color: '#ffffff' }}>
            Curated Destinations
          </h2>
          <div className="gold-divider center" />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Editorial guides and berth recommendations for the world’s most coveted maritime and winter playgrounds.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {destinations.map((dest) => (
            <a
              key={dest._id}
              href={`/destinations/${dest.slug}`}
              style={{
                height: '380px',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '2rem',
                textDecoration: 'none',
                backgroundImage: `linear-gradient(to top, rgba(9, 16, 26, 0.95) 0%, rgba(9, 16, 26, 0.3) 60%, transparent 100%), url(${dest.featuredImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid rgba(198, 167, 106, 0.2)',
                transition: 'all 0.35s ease',
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="gold-label" style={{ fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                  {dest.region}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#ffffff', marginBottom: '0.4rem' }}>
                  {dest.name}
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                  {dest.tagline}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    fontWeight: 600,
                  }}
                >
                  Explore Guide <ChevronRight size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

