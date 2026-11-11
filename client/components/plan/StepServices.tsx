'use client';

import React from 'react';
import { Plane, Anchor, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { RequestedService } from '../../types';

interface StepServicesProps {
  requestedServices: RequestedService[];
  toggleService: (service: RequestedService) => void;
}

export default function StepServices({ requestedServices, toggleService }: StepServicesProps) {
  const serviceOptions: Array<{
    id: RequestedService;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'private_jet',
      title: 'Private Jet Charter',
      desc: 'Heavy jet, ultra long-range, or VIP airliner flight coordination.',
      icon: <Plane size={24} />,
    },
    {
      id: 'superyacht',
      title: 'Superyacht Charter',
      desc: 'Bespoke maritime voyages with dedicated captain and culinary crew.',
      icon: <Anchor size={24} />,
    },
    {
      id: 'both',
      title: 'Combined Air & Sea Expedition',
      desc: 'Direct runway-to-helipad transfers and integrated journey routing.',
      icon: <Compass size={24} />,
    },
    {
      id: 'accommodation',
      title: 'Luxury Villa / Resort Buyouts',
      desc: 'Private island buyouts and ultra-prime cliffside estate accommodations.',
      icon: <Sparkles size={24} />,
    },
    {
      id: 'bespoke_experiences',
      title: 'Curated VIP Experiences',
      desc: 'Formula 1 trackside berths, submersibles, heli-skiing, and private access.',
      icon: <ShieldCheck size={24} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>
          Which services do you require?
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Select all charter categories applicable to your upcoming journey.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {serviceOptions.map((item) => {
          const isSelected = requestedServices.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleService(item.id)}
              style={{
                padding: '1.5rem',
                borderRadius: '2px',
                border: isSelected ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                background: isSelected ? 'rgba(198, 167, 106, 0.08)' : '#0d1624',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ color: isSelected ? 'var(--color-gold)' : '#94a3b8', marginBottom: '0.75rem' }}>
                {item.icon}
              </div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.35rem' }}>
                {item.title}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.5' }}>
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

