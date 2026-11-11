'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plane,
  ArrowRight,
  Shield,
  CheckCircle,
  Clock,
  Compass,
  ArrowLeft,
  ChevronRight,
  Wifi,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { fetchAircraftById } from '../../../lib/api';
import { IAircraft } from '../../../types';

export default function AircraftDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [aircraft, setAircraft] = useState<IAircraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        const data = await fetchAircraftById(id);
        setAircraft(data);
      } catch (err) {
        console.error('Error fetching aircraft detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09101a', color: 'var(--color-gold)' }}>
        Retrieving aircraft dossier...
      </div>
    );
  }

  if (!aircraft) {
    return (
      <div style={{ minHeight: '100vh', padding: '10rem 1.5rem', textAlign: 'center', backgroundColor: '#09101a' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff' }}>Aircraft Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '1rem', marginBottom: '2rem' }}>
          The requested aircraft is not currently listed in our published fleet directory.
        </p>
        <a href="/jets" className="btn-outline-gold">
          Return to Aircraft Directory
        </a>
      </div>
    );
  }

  const galleryImages = aircraft.images && aircraft.images.length > 0 ? aircraft.images : [aircraft.featuredImage];

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '5.5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#0d1622', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.85rem 0' }}>
        <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          <a href="/" style={{ color: '#94a3b8' }}>Home</a>
          <ChevronRight size={13} />
          <a href="/jets" style={{ color: '#94a3b8' }}>Private Jets</a>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-gold)' }}>{aircraft.name}</span>
        </div>
      </div>

      {/* Hero Showcase */}
      <section style={{ padding: '3.5rem 0 2rem 0' }}>
        <div className="container-luxury">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <span className="badge-gold" style={{ marginBottom: '0.75rem' }}>
                {aircraft.category}
              </span>
              <h1 className="heading-editorial" style={{ color: '#ffffff', marginBottom: '0.35rem' }}>
                {aircraft.name}
              </h1>
              <div style={{ fontSize: '1rem', color: 'var(--color-gold)', letterSpacing: '0.06em' }}>
                {aircraft.model}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {aircraft.hourlyRateEstimate && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Guidance Charter Rate</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: 'var(--color-gold)' }}>
                    ${aircraft.hourlyRateEstimate.toLocaleString()}{' '}
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>/ flight hour</span>
                  </div>
                </div>
              )}
              <a href={`/plan?aircraft=${aircraft._id}`} className="btn-gold" style={{ padding: '0.9rem 2.2rem' }}>
                Enquire for this Aircraft <ArrowRight size={16} />
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
            {/* Left: Overview & Amenities */}
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Aircraft Profile
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
                Aeronautical Excellence
              </h2>
              <div className="gold-divider" />
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                {aircraft.description}
              </p>

              <div className="gold-label" style={{ marginBottom: '1rem' }}>
                Onboard Amenities & Stateroom Features
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {aircraft.amenities.map((item, i) => (
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
                Technical Data Sheet
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff', marginBottom: '1.5rem' }}>
                Flight Capabilities
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Maximum Non-Stop Range</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{aircraft.range} nm / {Math.round(aircraft.range * 1.852)} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>High-Speed Cruise</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{aircraft.cruiseSpeed} knots (Mach 0.90)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Passenger Capacity</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>Up to {aircraft.passengerCapacity} Guests</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cabin Stand-Up Height</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{aircraft.cabinHeight}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Usable Baggage Volume</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{aircraft.baggageCapacity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Safety Audit Level</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>ARG/US Platinum & Wyvern</span>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <a href={`/plan?aircraft=${aircraft._id}`} className="btn-gold" style={{ width: '100%' }}>
                  Request Charter Quotation
                </a>
                <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.75rem' }}>
                  Subject to flight crew duty limits, slot confirmations, and aircraft owner approval.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

