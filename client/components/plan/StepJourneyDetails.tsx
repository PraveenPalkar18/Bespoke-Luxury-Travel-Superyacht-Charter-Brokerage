'use client';

import React from 'react';

interface StepJourneyDetailsProps {
  formData: {
    departureLocation: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    isFlexibleDates: boolean;
    travellers: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepJourneyDetails({ formData, setFormData }: StepJourneyDetailsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>
          Where will you be travelling?
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Indicate preferred departure and destination ports, airfields, or island grounds.
        </p>
      </div>

      <div className="grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Departure Location / Airport *
          </label>
          <input
            type="text"
            placeholder="e.g. London Farnborough (EGLF) or Paris Le Bourget"
            value={formData.departureLocation}
            onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
            className="luxury-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Destination / Cruising Waters *
          </label>
          <input
            type="text"
            placeholder="e.g. Monaco Port Hercule / Nice or The Maldives"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="luxury-input"
          />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Departure Date *
          </label>
          <input
            type="date"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            className="luxury-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Return Date (Optional)
          </label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            className="luxury-input"
          />
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Number of Travellers / Guests *
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={formData.travellers}
            onChange={(e) => setFormData({ ...formData, travellers: parseInt(e.target.value, 10) || 1 })}
            className="luxury-input"
          />
        </div>

        <div style={{ paddingTop: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={formData.isFlexibleDates}
              onChange={(e) => setFormData({ ...formData, isFlexibleDates: e.target.checked })}
              style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
            />
            <span>My travel dates are flexible (+/- 3 days)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

