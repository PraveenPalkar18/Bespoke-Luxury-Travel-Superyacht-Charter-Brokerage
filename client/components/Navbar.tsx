'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Private Jets', href: '/jets' },
    { name: 'Superyachts', href: '/yachts' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Experiences', href: '/experiences' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null; // Dashboard uses its own specialized layout
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.35s ease',
        backgroundColor: scrolled ? 'rgba(9, 16, 26, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(198, 167, 106, 0.2)' : '1px solid transparent',
        padding: scrolled ? '0.85rem 0' : '1.35rem 0',
      }}
    >
      <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <a href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            AURELIA <span style={{ color: 'var(--color-gold)' }}>&</span> CO.
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.3em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: '-2px',
            }}
          >
            Bespoke Aviation & Superyacht Charters
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.name}
                href={link.href}
                style={{
                  fontSize: '0.825rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-gold)' : '#e2e8f0',
                  position: 'relative',
                  padding: '0.25rem 0',
                  transition: 'color 0.2s ease',
                }}
              >
                {link.name}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'var(--color-gold)',
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Public Client CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-actions">
          <a href="/plan" className="btn-gold" style={{ padding: '0.65rem 1.4rem', fontSize: '0.75rem' }}>
            Plan Your Journey
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-ivory)',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#09101a',
            borderBottom: '1px solid rgba(198, 167, 106, 0.25)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '0.95rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: pathname === link.href ? 'var(--color-gold)' : '#ffffff',
                padding: '0.4rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {link.name}
            </a>
          ))}
          <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a
              href="/plan"
              className="btn-gold"
              onClick={() => setMobileMenuOpen(false)}
              style={{ textAlign: 'center', width: '100%' }}
            >
              Plan Your Journey
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 992px) {
          .desktop-nav,
          .desktop-actions {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}

