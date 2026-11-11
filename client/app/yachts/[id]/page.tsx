'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Anchor,
  ArrowRight,
  Shield,
  CheckCircle,
  Clock,
  Compass,
  ChevronRight,
  Waves,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { fetchYachtById } from '../../../lib/api';
import { IYacht } from '../../../types';

export default function YachtDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [yacht, setYacht] = useState<IYacht | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        const data = await fetchYachtById(id);
        setYacht(data);
      } catch (err) {
        console.error('Error fetching yacht detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09101a', color: 'var(--color-gold)' }}>
        Retrieving yacht dossier...
      </div>
    );
  }

  if (!yacht) {
    return (
      <div style={{ minHeight: '100vh', padding: '10rem 1.5rem', textAlign: 'center', backgroundColor: '#09101a' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff' }}>Yacht Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '1rem', marginBottom: '2rem' }}>
          The requested yacht is not currently listed in our published fleet directory.
        </p>
        <a href="/yachts" className="btn-outline-gold">
          Return to Superyacht Collection
        </a>
      </div>
    );
  }

  const galleryImages = yacht.images && yacht.images.length > 0 ? yacht.images : [yacht.featuredImage];

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '5.5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#0d1622', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.85rem 0' }}>
        <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          <a href="/" style={{ color: '#94a3b8' }}>Home</a>
          <ChevronRight size={13} />
          <a href="/yachts" style={{ color: '#94a3b8' }}>Superyachts</a>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-gold)' }}>{yacht.name}</span>
        </div>
      </div>

      {/* Hero Showcase */}
      <section style={{ padding: '3.5rem 0 2rem 0' }}>
        <div className="container-luxury">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.75rem' }}>
                {yacht.length}m / {yacht.lengthFeet}ft • {yacht.builder} ({yacht.yearBuilt})
              </span>
              <h1 className="heading-editorial" style={{ color: '#ffffff', marginBottom: '0.35rem' }}>
                {yacht.name}
              </h1>
              <div style={{ fontSize: '1rem', color: 'var(--color-gold)', letterSpacing: '0.06em' }}>
                Cruising Grounds: {yacht.regions.join(' • ')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {yacht.weeklyRateEstimate && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Charter Guidance From</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: 'var(--color-gold)' }}>
                    ${yacht.weeklyRateEstimate.toLocaleString()}{' '}
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>/ week + expenses (MYBA)</span>
                  </div>
                </div>
              )}
              <a href={`/plan?yacht=${yacht._id}`} className="btn-gold" style={{ padding: '0.9rem 2.2rem' }}>
                Reserve Charter Dossier <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Main Gallery Display */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '520px',
                borderRadius: '2px',
                backgroundImage: `url(${galleryImages[activeImageIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid rgba(198, 167, 106, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
                transition: 'background-image 0.4s ease',
              }}
            />

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '120px',
                      height: '75px',
                      borderRadius: '2px',
                      backgroundImage: `url(${img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: activeImageIndex === idx ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      opacity: activeImageIndex === idx ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Specifications & Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', marginBottom: '4rem' }}>
            {/* Left: Overview, Amenities & Toys */}
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Naval Architecture & Living Concept
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
                Maritime Sanctuarial Luxury
              </h2>
              <div className="gold-divider" />
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                {yacht.description}
              </p>

              <div className="gold-label" style={{ marginBottom: '1rem' }}>
                Luxury Amenities & Deck Features
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {yacht.amenities.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: '#142236',
                      padding: '0.85rem 1rem',
                      border: '1px solid rgba(198, 167, 106, 0.18)',
                      borderRadius: '2px',
                      fontSize: '0.85rem',
                      color: '#f7f5f0',
                    }}
                  >
                    <CheckCircle size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="gold-label" style={{ marginBottom: '1rem' }}>
                Tenders, Submersibles & Water Toys
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {yacht.tendersAndToys.map((toy, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: '#0e1724',
                      padding: '0.85rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                    }}
                  >
                    <Waves size={15} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                    <span>{toy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Technical Specification Dossier */}
            <div
              style={{
                background: '#101c2c',
                padding: '2.5rem',
                border: '1px solid rgba(198, 167, 106, 0.25)',
                borderRadius: '2px',
              }}
            >
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Vessel Specifications
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff', marginBottom: '1.5rem' }}>
                Naval Architecture
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Shipyard & Builder</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.builder}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Year Built / Refit</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.yearBuilt}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Length Overall (LOA)</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.length}m / {yacht.lengthFeet}ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Beam & Draft</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.beam}m Beam / {yacht.draft}m Draft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Guest Capacity</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.guestCapacity} Guests across {yacht.cabins} Staterooms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Crew Compliment</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.crew} International Officers & Staff</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cruising Speed</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.cruisingSpeed} Knots</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Contract Format</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Standard MYBA Terms</span>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <a href={`/plan?yacht=${yacht._id}`} className="btn-gold" style={{ width: '100%' }}>
                  Request Charter Availability
                </a>
                <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.75rem' }}>
                  Weekly rate does not include APA (Advance Provisioning Allowance, typically 30-35%) and applicable local VAT.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

