'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ExperiencesPage() {
  const experiences = [
    {
      title: 'Monaco Grand Prix VIP Trackside Superyacht Berth',
      category: 'Formula 1 & Maritime',
      location: 'Port Hercule, Monaco',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85',
      description: 'Anchor on Quay Kennedy directly along the race circuit chicane. Includes pit lane passes, onboard champagne hospitality prepared by Michelin-starred guest chefs, and nightly deck galas.',
      highlights: ['Front-row yacht berth viewing chicane', 'Helicopter transfer from Nice airport tarmac', 'Paddock club passes & driver meet-and-greets'],
    },
    {
      title: 'Bespoke Private Island Takeover & Coral Reef Bio-Dive',
      category: 'Ultra-Secluded Island Escape',
      location: 'Baa Atoll, UNESCO Biosphere, Maldives',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85',
      description: 'Complete buyout of an exclusive Maldivian coral island, paired with an 85m explorer superyacht equipped with a 3-person private submersible for deep sea bioluminescent diving.',
      highlights: ['Full private island exclusivity with dedicated butler staff', 'Triton submersible manned dives with marine biologists', 'Sunset sandbank dinners under starlit constellations'],
    },
    {
      title: 'Arctic Heli-Skiing from Superyacht Touch-and-Go Deck',
      category: 'Polar Adventure',
      location: 'Svalbard & Norwegian Fjords',
      image: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1200&q=85',
      description: 'Ski virgin powder slopes dropping vertically into arctic fjords, accessed directly from an ice-class explorer superyacht with dual helicopters and onboard wellness spa.',
      highlights: ['IFMGA certified alpine mountain guides', 'Airbus H130 helicopters operating from onboard helipad', 'Sauna, cryotherapy and hot springs recovery'],
    },
    {
      title: 'St. Barths Festive Season Superyacht Regatta Gala',
      category: 'Caribbean Society',
      location: 'Gustavia Harbour, Saint-Barthélemy',
      image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=85',
      description: 'Celebrate New Year’s Eve in Gustavia with prime harbor anchoring, private participation in the St. Barths Bucket regatta, and reserved beachfront cabanas at Eden Rock.',
      highlights: ['Prime Gustavia outer harbor anchorage', 'VIP tables at Shellona and Nikki Beach', 'Private catamaran regatta chase craft'],
    },
  ];

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Hero Header */}
      <section
        style={{
          padding: '4rem 1.5rem 3rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.75), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
        }}
      >
        <div className="container-luxury" style={{ textAlign: 'center' }}>
          <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
            Unrivalled Expeditions
          </div>
          <h1 className="heading-editorial" style={{ marginBottom: '1rem', color: '#ffffff' }}>
            Bespoke Travel Experiences
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Transforming private aviation and maritime chartering into once-in-a-lifetime moments designed around complete privacy, rare access, and exquisite hospitality.
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="section-spacing">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
            {experiences.map((exp, idx) => (
              <div key={idx} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    height: '240px',
                    backgroundImage: `url(${exp.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <span className="badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    {exp.category}
                  </span>
                  <span
                    className="badge-navy"
                    style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'rgba(9,16,26,0.85)' }}
                  >
                    {exp.location}
                  </span>
                </div>

                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>
                    {exp.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '1.5rem', flex: 1 }}>
                    {exp.description}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
                      Key Features & Inclusions
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {exp.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                          <CheckCircle2 size={13} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a href={`/plan?experience=${encodeURIComponent(exp.title)}`} className="btn-gold" style={{ width: '100%', fontSize: '0.78rem' }}>
                    Inquire For This Experience
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

