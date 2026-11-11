'use client';

import React, { useState, useEffect } from 'react';
import { Compass, MapPin, ChevronRight, Plane, Anchor, Calendar } from 'lucide-react';
import { fetchDestinations } from '../../lib/api';
import { IDestination } from '../../types';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await fetchDestinations();
        setDestinations(data);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            Charter Playgrounds
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            Curated Global Destinations
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Editorial itineraries, private aviation FBOs, and guaranteed superyacht berths in the world’s most exclusive coastal enclaves and winter havens.
          </p>
        </div>
      </section>

      {/* Destinations Editorial Showcase */}
      <section className="section-spacing">
        <div className="container-luxury">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold)' }}>
              Loading destination portfolios...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {destinations.map((dest, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={dest._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '3rem',
                      alignItems: 'center',
                      background: '#101c2c',
                      border: '1px solid rgba(198, 167, 106, 0.2)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Image Column */}
                    <div
                      style={{
                        height: '420px',
                        backgroundImage: `url(${dest.featuredImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        order: isEven ? 1 : 2,
                      }}
                    />

                    {/* Content Column */}
                    <div style={{ padding: '2.5rem', order: isEven ? 2 : 1 }}>
                      <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                        {dest.region}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                        {dest.name}
                      </h2>
                      <div style={{ fontStyle: 'italic', color: 'var(--color-gold)', fontSize: '1rem', marginBottom: '1.25rem' }}>
                        &ldquo;{dest.tagline}&rdquo;
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        {dest.description}
                      </p>

                      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Ideal Charter Season</div>
                          <div style={{ color: '#f7f5f0', fontWeight: 600, fontSize: '0.9rem' }}>{dest.bestTimeToVisit}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Nearest Private FBO</div>
                          <div style={{ color: '#f7f5f0', fontWeight: 600, fontSize: '0.9rem' }}>{dest.nearestAirports[0]}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href={`/destinations/${dest.slug}`} className="btn-outline-gold" style={{ fontSize: '0.78rem' }}>
                          Explore Editorial Guide <ChevronRight size={14} />
                        </a>
                        <a href={`/plan?destination=${encodeURIComponent(dest.name)}`} className="btn-gold" style={{ fontSize: '0.78rem' }}>
                          Plan Itinerary
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

