'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { IAircraft } from '../../types';

interface AddJetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jetData: Partial<IAircraft>) => Promise<void>;
}

export default function AddJetModal({ isOpen, onClose, onSubmit }: AddJetModalProps) {
  const [jet, setJet] = useState({
    name: '',
    model: '',
    category: 'Ultra Long-Range' as const,
    passengerCapacity: 14,
    range: 6500,
    cruiseSpeed: 500,
    cabinHeight: '6 ft 2 in',
    baggageCapacity: '150 cu ft',
    hourlyRateEstimate: 12500,
    amenities: ['Master Stateroom', 'Ka-band High Speed WiFi', 'Full Galley'],
    featuredImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=85',
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=85'],
    description: 'Executive private aviation flagship engineered for intercontinental transits with whisper-quiet cabin.',
    editorialSummary: 'Intercontinental executive flagship with spacious living spaces.',
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(jet);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div style={{ background: '#0e1724', border: '1px solid rgba(198, 167, 106, 0.35)', padding: '2.5rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff' }}>Add New Aircraft Listing</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Aircraft Name</label>
              <input type="text" required placeholder="e.g. Dassault Falcon 10X" value={jet.name} onChange={(e) => setJet({ ...jet, name: e.target.value })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Model</label>
              <input type="text" required placeholder="e.g. Falcon 10X Flagship" value={jet.model} onChange={(e) => setJet({ ...jet, model: e.target.value })} className="luxury-input" />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Category</label>
              <select value={jet.category} onChange={(e) => setJet({ ...jet, category: e.target.value as any })} className="luxury-select">
                <option value="Ultra Long-Range">Ultra Long-Range</option>
                <option value="Heavy Jet">Heavy Jet</option>
                <option value="Super Midsize">Super Midsize</option>
                <option value="VIP Airliner">VIP Airliner</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Hourly Rate Est. (USD)</label>
              <input type="number" required value={jet.hourlyRateEstimate} onChange={(e) => setJet({ ...jet, hourlyRateEstimate: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Range (nm)</label>
              <input type="number" required value={jet.range} onChange={(e) => setJet({ ...jet, range: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Cruise Speed (kts)</label>
              <input type="number" required value={jet.cruiseSpeed} onChange={(e) => setJet({ ...jet, cruiseSpeed: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Passenger Capacity</label>
              <input type="number" required value={jet.passengerCapacity} onChange={(e) => setJet({ ...jet, passengerCapacity: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Featured Image URL</label>
            <input type="url" required value={jet.featuredImage} onChange={(e) => setJet({ ...jet, featuredImage: e.target.value, images: [e.target.value] })} className="luxury-input" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Description</label>
            <textarea rows={3} required value={jet.description} onChange={(e) => setJet({ ...jet, description: e.target.value })} className="luxury-input" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-gold" style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Save Aircraft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

