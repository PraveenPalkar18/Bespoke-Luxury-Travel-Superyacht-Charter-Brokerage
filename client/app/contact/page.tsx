'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Charter Consultation',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            VIP Communications
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            Contact Our Charter Directors
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Our international brokerage team provides 24/7 dedicated advisory across private aviation, yacht chartering, and discreet itinerary curation.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section-spacing">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            {/* Contact Details & Worldwide Desks */}
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Global Concierge
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
                Immediate Assistance
              </h2>
              <div className="gold-divider" />
              <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                For short-notice private aviation departures or urgent yacht berth reservations, connect directly with our duty officers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>24/7 Charter Emergency Desk</div>
                    <a href="tel:+37798062000" style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600 }}>
                      +377 98 06 20 00 (Monaco)
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Secure Inquiries Desk</div>
                    <a href="mailto:charters@aureliatravel.com" style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600 }}>
                      charters@aureliatravel.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Response Time Commitment</div>
                    <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                      Under 2 hours for preliminary charter dossiers
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#101c2c', padding: '1.75rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <ShieldCheck size={18} /> Confidentiality & Non-Disclosure
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.825rem', lineHeight: '1.6' }}>
                  If your family office requires custom NDA execution before manifest transmission, our legal counsel will issue bilateral documentation within 30 minutes.
                </p>
              </div>
            </div>

            {/* Direct Message Form */}
            <div
              style={{
                background: '#101c2c',
                padding: '3rem',
                border: '1px solid rgba(198, 167, 106, 0.25)',
                borderRadius: '2px',
              }}
            >
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Direct Transmission
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#ffffff', marginBottom: '1.5rem' }}>
                Send a VIP Message
              </h3>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>
                    <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                    Message Transmitted
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Thank you, {formData.name}. Your message has been routed to our Senior Charter Desk. A director will reach out promptly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline-gold"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Evelyn Sterling"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sterling@familyoffice.co.uk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Telephone / WhatsApp (with country code)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +44 20 7946 0912"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Nature of Inquiry
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="luxury-select"
                    >
                      <option value="Private Aviation Charter">Private Aviation Charter</option>
                      <option value="Superyacht Charter">Superyacht Charter</option>
                      <option value="Combined Air & Sea Expedition">Combined Air & Sea Expedition</option>
                      <option value="Monaco Grand Prix VIP Berth">Monaco Grand Prix VIP Berth</option>
                      <option value="Corporate Flight Department Support">Corporate Flight Department Support</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Message & Requirements
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Provide preliminary dates, passenger counts, or specific aircraft/yacht references..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="luxury-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: '0.5rem', width: '100%' }}>
                    Transmit Inquiry <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

