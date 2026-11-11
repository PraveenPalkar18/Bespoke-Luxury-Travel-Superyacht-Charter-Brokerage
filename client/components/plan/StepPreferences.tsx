'use client';

import React from 'react';

interface StepPreferencesProps {
  budgetRange: string;
  setBudgetRange: (b: string) => void;
  travelPreferences: string[];
  togglePreference: (p: string) => void;
  specialRequests: string;
  setSpecialRequests: (s: string) => void;
}

export default function StepPreferences({
  budgetRange,
  setBudgetRange,
  travelPreferences,
  togglePreference,
  specialRequests,
  setSpecialRequests,
}: StepPreferencesProps) {
  const budgetTiers = ['$50k - $100k', '$100k - $250k', '$250k - $500k', '$500k - $1M', '$1M+'];

  const availablePreferences = [
    'Ultra Long-Range Jet',
    'Motor Yacht >60m with Helipad',
    'Strict Non-Disclosure / NDA',
    'Michelin-Trained Private Chef',
    'Direct Runway Apron Car Access',
    'Deep Sea Submersible Onboard',
    'Pet Traveling Onboard',
    'VIP F1 Paddock Access',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>
          Preferences & Budget Framework
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Charter pricing aligns with asset specifications, positioning, and crew requirements.
        </p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
          Estimated Charter Budget (USD) *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {budgetTiers.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setBudgetRange(tier)}
              style={{
                padding: '0.85rem',
                borderRadius: '2px',
                border: budgetRange === tier ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                background: budgetRange === tier ? 'var(--color-gold)' : '#0d1624',
                color: budgetRange === tier ? '#09101a' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
          Travel Specifics & Preferences
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availablePreferences.map((pref) => {
            const isSelected = travelPreferences.includes(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => togglePreference(pref)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.78rem',
                  borderRadius: '2px',
                  border: isSelected ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.12)',
                  background: isSelected ? 'rgba(198, 167, 106, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--color-gold)' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                + {pref}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
          Specific Requests or Cabin / Stateroom Configuration
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Master suite + 2 VIP staterooms required, Ka-band internet required for business teleconferences..."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="luxury-input"
        />
      </div>
    </div>
  );
}

