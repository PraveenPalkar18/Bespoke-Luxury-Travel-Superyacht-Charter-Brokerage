'use client';

import React, { useState, useEffect } from 'react';
import { Plane, Search, SlidersHorizontal, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchAircraft } from '../../lib/api';
import { IAircraft, AircraftCategory } from '../../types';

export default function JetsPage() {
  const [aircraftList, setAircraftList] = useState<IAircraft[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ['All', 'Ultra Long-Range', 'Heavy Jet', 'Super Midsize', 'VIP Airliner'];

  useEffect(() => {
    async function loadJets() {
      setLoading(true);
      try {
        const data = await fetchAircraft({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery || undefined,
        });
        setAircraftList(data);
      } catch (err) {
        console.error('Error fetching aircraft:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJets();
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            Aviation Division
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            Private Jet Charter Fleet
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            From non-stop intercontinental business flagships to executive VIP airliners, our fleet provides global reach, acoustic serenity, and uncompromising safety.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section style={{ backgroundColor: '#0e1724', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '1.5rem 0' }}>
        <div className="container-luxury">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '2px',
                    border: selectedCategory === cat ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: selectedCategory === cat ? 'var(--color-gold)' : 'transparent',
                    color: selectedCategory === cat ? '#09101a' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search aircraft or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="luxury-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gold)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Aircraft Grid */}
      <section className="section-spacing">
        <div className="container-luxury">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold)' }}>
              Loading luxury fleet directory...
            </div>
          ) : aircraftList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
              No aircraft found matching your current filter criteria.
            </div>
          ) : (
            <div className="grid-3">
              {aircraftList.map((aircraft) => (
                <div key={aircraft._id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      height: '250px',
                      backgroundImage: `url(${aircraft.featuredImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <span className="badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      {aircraft.category}
                    </span>
                    {aircraft.hourlyRateEstimate && (
                      <span
                        className="badge-navy"
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          backgroundColor: 'rgba(9,16,26,0.85)',
                          color: 'var(--color-gold)',
                        }}
                      >
                        Est. ${aircraft.hourlyRateEstimate.toLocaleString()}/hr
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                      {aircraft.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                      {aircraft.model}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                      {aircraft.description}
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
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Capacity</div>
                        <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{aircraft.passengerCapacity} Pax</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Speed</div>
                        <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{aircraft.cruiseSpeed} kts</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <a href={`/jets/${aircraft._id}`} className="btn-outline-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                        Dossier
                      </a>
                      <a href={`/plan?aircraft=${aircraft._id}`} className="btn-gold" style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.75rem' }}>
                        Enquire
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

