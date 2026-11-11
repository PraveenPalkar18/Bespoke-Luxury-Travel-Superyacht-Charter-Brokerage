'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Shield, Award, Anchor, Plane, ArrowUpRight, Lock, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide public footer in the internal broker dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: '#070d15',
        borderTop: '1px solid rgba(198, 167, 106, 0.2)',
        color: '#a0aec0',
        paddingTop: '5rem',
        paddingBottom: '2.5rem',
        position: 'relative',
      }}
    >
      <div className="container-luxury">
        {/* Top Brand & Global Hubs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '3rem',
            marginBottom: '4.5rem',
          }}
        >
          {/* Brand Introduction */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.75rem',
                  letterSpacing: '0.15em',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                }}
              >
                AURELIA <span style={{ color: 'var(--color-gold)' }}>&</span> CO.
              </span>
              <div
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.25em',
                  color: 'var(--color-gold)',
                  textTransform: 'uppercase',
                  marginTop: '0.2rem',
                }}
              >
                Superyacht & Aviation Brokerage
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#94a3b8', marginBottom: '1.5rem' }}>
              The global reference in bespoke aviation, superyacht voyages, and ultra-rare luxury expeditions. Connecting discerning family offices and sovereign clients with the world’s finest fleets.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={12} style={{ color: 'var(--color-gold)' }} /> MYBA Member
              </span>
              <span className="badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={12} style={{ color: 'var(--color-gold)' }} /> EBAA Certified
              </span>
              <span className="badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plane size={12} style={{ color: 'var(--color-gold)' }} /> NBAA Corporate
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="gold-label" style={{ marginBottom: '1.25rem' }}>
              Private Portfolios
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <a href="/jets" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                  Private Jet Fleet
                </a>
              </li>
              <li>
                <a href="/yachts" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                  Superyacht Collection
                </a>
              </li>
              <li>
                <a href="/destinations" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                  Curated Destinations
                </a>
              </li>
              <li>
                <a href="/experiences" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                  Bespoke Expeditions
                </a>
              </li>
              <li>
                <a href="/plan" className="btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                  Plan Your Journey <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Global Operations Hubs */}
          <div>
            <div className="gold-label" style={{ marginBottom: '1.25rem' }}>
              Worldwide Brokerage Hubs
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem' }}>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>Monaco (Headquarters)</div>
                <div style={{ color: '#64748b' }}>27 Boulevard Albert 1er, Port Hercule, MC 98000</div>
                <div style={{ color: 'var(--color-gold)', marginTop: '0.15rem' }}>+377 98 06 20 00</div>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>London Mayfair</div>
                <div style={{ color: '#64748b' }}>14 Berkeley Square, London W1J 6BQ</div>
                <div style={{ color: 'var(--color-gold)', marginTop: '0.15rem' }}>+44 20 7946 0888</div>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>New York & Dubai</div>
                <div style={{ color: '#64748b' }}>Fifth Avenue, NY • Gate Village DIFC, Dubai</div>
              </div>
            </div>
          </div>

          {/* Discretion & Contact */}
          <div>
            <div className="gold-label" style={{ marginBottom: '1.25rem' }}>
              Charter Protocol
            </div>
            <p style={{ fontSize: '0.825rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1.25rem' }}>
              All client itineraries, private aviation routings, and charter agreements operate under unyielding discretion and non-disclosure standards.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>
                DIRECT BROKERAGE INQUIRIES
              </div>
              <a
                href="mailto:charters@aureliatravel.com"
                style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.875rem' }}
              >
                charters@aureliatravel.com
              </a>
              <div style={{ marginTop: '0.75rem' }}>
                <a
                  href="/dashboard/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-gold)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Lock size={12} /> Broker & Partner Portal
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} Aurelia & Co. Luxury Brokerage Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/about" style={{ color: '#94a3b8' }}>
              The Aurelia Standard
            </a>
            <a href="/contact" style={{ color: '#94a3b8' }}>
              Global Concierge
            </a>
            <a href="/dashboard/login" style={{ color: 'var(--color-gold)' }}>
              Internal Terminal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

