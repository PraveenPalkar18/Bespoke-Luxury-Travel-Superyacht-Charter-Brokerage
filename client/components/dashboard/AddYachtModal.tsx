'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { IYacht } from '../../types';

interface AddYachtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (yachtData: Partial<IYacht>) => Promise<void>;
}

export default function AddYachtModal({ isOpen, onClose, onSubmit }: AddYachtModalProps) {
  const [yacht, setYacht] = useState({
    name: '',
    builder: '',
    yearBuilt: 2022,
    length: 65.0,
    lengthFeet: 213,
    guestCapacity: 12,
    cabins: 6,
    crew: 16,
    beam: 11.2,
    draft: 3.4,
    cruisingSpeed: 15,
    weeklyRateEstimate: 550000,
    regions: ['Mediterranean', 'French Riviera'],
    amenities: ['Beach Club', 'Helipad', 'Jacuzzi', 'Gym'],
    tendersAndToys: ['10m Custom Limo Tender', '2x Sea-Doo Jet Skis', 'Seabobs'],
    featuredImage: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=85',
    images: ['https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=85'],
    description: 'Magnificent displacement superyacht designed for lavish cruising across the Mediterranean.',
    editorialSummary: 'Bespoke custom superyacht featuring sun deck jacuzzi and expansive beach club.',
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(yacht);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div style={{ background: '#0e1724', border: '1px solid rgba(198, 167, 106, 0.35)', padding: '2.5rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff' }}>Add Superyacht Listing</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Yacht Name</label>
              <input type="text" required placeholder="e.g. M/Y CELESTIA" value={yacht.name} onChange={(e) => setYacht({ ...yacht, name: e.target.value })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Builder</label>
              <input type="text" required placeholder="e.g. Feadship" value={yacht.builder} onChange={(e) => setYacht({ ...yacht, builder: e.target.value })} className="luxury-input" />
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Length (meters)</label>
              <input type="number" required value={yacht.length} onChange={(e) => setYacht({ ...yacht, length: parseFloat(e.target.value), lengthFeet: Math.round(parseFloat(e.target.value) * 3.28) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Year Built</label>
              <input type="number" required value={yacht.yearBuilt} onChange={(e) => setYacht({ ...yacht, yearBuilt: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Weekly Rate ($)</label>
              <input type="number" required value={yacht.weeklyRateEstimate} onChange={(e) => setYacht({ ...yacht, weeklyRateEstimate: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Guests</label>
              <input type="number" required value={yacht.guestCapacity} onChange={(e) => setYacht({ ...yacht, guestCapacity: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Cabins</label>
              <input type="number" required value={yacht.cabins} onChange={(e) => setYacht({ ...yacht, cabins: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Crew</label>
              <input type="number" required value={yacht.crew} onChange={(e) => setYacht({ ...yacht, crew: parseInt(e.target.value, 10) })} className="luxury-input" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Featured Image URL</label>
            <input type="url" required value={yacht.featuredImage} onChange={(e) => setYacht({ ...yacht, featuredImage: e.target.value, images: [e.target.value] })} className="luxury-input" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Description</label>
            <textarea rows={3} required value={yacht.description} onChange={(e) => setYacht({ ...yacht, description: e.target.value })} className="luxury-input" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-gold" style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Save Superyacht'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

