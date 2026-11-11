'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Compass,
  MapPin,
  Plane,
  Anchor,
  Calendar,
  CheckCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { fetchDestinationByIdOrSlug } from '../../../lib/api';
import { IDestination } from '../../../types';

export default function DestinationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [destination, setDestination] = useState<IDestination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        const data = await fetchDestinationByIdOrSlug(id);
        setDestination(data);
      } catch (err) {
        console.error('Error fetching destination guide:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09101a', color: 'var(--color-gold)' }}>
        Loading destination guide...
      </div>
    );
  }

  if (!destination) {
    return (
      <div style={{ minHeight: '100vh', padding: '10rem 1.5rem', textAlign: 'center', backgroundColor: '#09101a' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff' }}>Destination Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '1rem', marginBottom: '2rem' }}>
          The requested luxury destination guide is not currently published.
        </p>
        <a href="/destinations" className="btn-outline-gold">
          View All Destinations
        </a>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '5.5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#0d1622', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.85rem 0' }}>
        <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          <a href="/" style={{ color: '#94a3b8' }}>Home</a>
          <ChevronRight size={13} />
          <a href="/destinations" style={{ color: '#94a3b8' }}>Destinations</a>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-gold)' }}>{destination.name}</span>
        </div>
      </div>

      {/* Cinematic Destination Hero */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 1.5rem 5rem 1.5rem',
          backgroundImage: `linear-gradient(to bottom, rgba(9, 16, 26, 0.45) 0%, rgba(9, 16, 26, 0.9) 100%), url(${destination.featuredImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          borderBottom: '1px solid rgba(198, 167, 106, 0.25)',
        }}
      >
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <span className="badge-gold" style={{ marginBottom: '1rem', backgroundColor: 'rgba(9, 16, 26, 0.8)' }}>
            {destination.region}
          </span>
          <h1 className="heading-display" style={{ color: '#ffffff', marginBottom: '0.75rem' }}>
            {destination.name}
          </h1>
          <div style={{ fontStyle: 'italic', color: 'var(--color-gold)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {destination.tagline}
          </div>
          <div className="gold-divider center" />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a href={`/plan?destination=${encodeURIComponent(destination.name)}`} className="btn-gold" style={{ padding: '0.95rem 2.2rem' }}>
              Commission Charter Here <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Editorial Content & Guide Grid */}
      <section className="section-spacing">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            {/* Left: Overview & Highlights */}
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Editorial Guide
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
                The Charter Experience
              </h2>
              <div className="gold-divider" />
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                {destination.description}
              </p>

              <div className="gold-label" style={{ marginBottom: '1rem' }}>
                Curated Highlights & Access Points
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {destination.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      background: '#101c2c',
                      padding: '1.25rem',
                      border: '1px solid rgba(198, 167, 106, 0.2)',
                      borderRadius: '2px',
                    }}
                  >
                    <CheckCircle size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '0.925rem', color: '#f7f5f0', lineHeight: '1.6' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Airports & Harbours Card */}
            <div>
              <div
                style={{
                  background: '#101c2c',
                  padding: '2.5rem',
                  border: '1px solid rgba(198, 167, 106, 0.25)',
                  borderRadius: '2px',
                  marginBottom: '2rem',
                }}
              >
                <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                  Logistics & Access
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff', marginBottom: '1.5rem' }}>
                  Aviation & Berth Details
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    <Calendar size={16} /> Recommended Charter Season
                  </div>
                  <div style={{ color: '#f7f5f0', fontSize: '1rem', paddingLeft: '1.5rem' }}>
                    {destination.bestTimeToVisit}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    <Plane size={16} /> Nearest Private Aviation FBOs
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem' }}>
                    {destination.nearestAirports.map((airport, i) => (
                      <div key={i} style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                        • {airport}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    <Anchor size={16} /> Primary Superyacht Harbours
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem' }}>
                    {destination.featuredPorts.map((port, i) => (
                      <div key={i} style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                        • {port}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Enquiry Box */}
              <div
                style={{
                  background: '#142236',
                  padding: '2rem',
                  border: '1px solid rgba(198, 167, 106, 0.35)',
                  borderRadius: '2px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  Plan Your {destination.name} Voyage
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Our Monaco & London desks can secure priority berths, private flight slots, and VIP villa buyouts.
                </p>
                <a href={`/plan?destination=${encodeURIComponent(destination.name)}`} className="btn-gold" style={{ width: '100%' }}>
                  Submit Bespoke Enquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

