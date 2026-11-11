'use client';

import React, { useState, useEffect } from 'react';
import { Anchor, Search, ChevronRight, ArrowRight, ShieldCheck, Waves } from 'lucide-react';
import { fetchYachts } from '../../lib/api';
import { IYacht } from '../../types';

export default function YachtsPage() {
  const [yachtList, setYachtList] = useState<IYacht[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const regions = ['All', 'French Riviera', 'Mediterranean', 'Caribbean', 'Maldives'];

  useEffect(() => {
    async function loadYachts() {
      setLoading(true);
      try {
        const data = await fetchYachts({
          region: selectedRegion === 'All' ? undefined : selectedRegion,
          search: searchQuery || undefined,
        });
        setYachtList(data);
      } catch (err) {
        console.error('Error fetching superyachts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadYachts();
  }, [selectedRegion, searchQuery]);

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            Maritime Division
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            Superyacht Charter Collection
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Majestic vessels commanding global waters. From Monaco Grand Prix trackside berths to secluded Maldivian atoll anchorages, enjoy world-class naval architecture and Michelin-trained crew.
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
            {/* Region Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '2px',
                    border: selectedRegion === reg ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: selectedRegion === reg ? 'var(--color-gold)' : 'transparent',
                    color: selectedRegion === reg ? '#09101a' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search yacht or builder..."
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

      {/* Yacht Grid */}
      <section className="section-spacing">
        <div className="container-luxury">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gold)' }}>
              Loading superyacht fleet directory...
            </div>
          ) : yachtList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
              No superyachts found matching your current filter criteria.
            </div>
          ) : (
            <div className="grid-3">
              {yachtList.map((yacht) => (
                <div key={yacht._id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      height: '250px',
                      backgroundImage: `url(${yacht.featuredImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <span className="badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      {yacht.length}m / {yacht.lengthFeet}ft
                    </span>
                    <span
                      className="badge-navy"
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: 'rgba(9,16,26,0.85)',
                      }}
                    >
                      {yacht.builder}
                    </span>
                  </div>

                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                      {yacht.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                      {yacht.regions.join(' • ')}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                      {yacht.description}
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
                        <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.guestCapacity} Pax</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Cabins</div>
                        <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.cabins} Suites</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Crew</div>
                        <div style={{ fontSize: '0.9rem', color: '#f7f5f0', fontWeight: 600 }}>{yacht.crew} Staff</div>
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
          )}
        </div>
      </section>
    </div>
  );
}

