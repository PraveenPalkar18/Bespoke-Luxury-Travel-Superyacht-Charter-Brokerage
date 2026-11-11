'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface StepContactProps {
  formData: {
    customerName: string;
    email: string;
    phone: string;
    preferredContactMethod: 'phone' | 'email' | 'whatsapp';
    additionalMessage: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepContact({ formData, setFormData }: StepContactProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#ffffff' }}>
          Charter Principal & Contact Protocol
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Our Senior Charter Director will deliver your tailored dossier through your preferred channel.
        </p>
      </div>

      <div className="grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Principal / Executive Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Lord Evelyn Sterling"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="luxury-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Secure Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g. sterling@familyoffice.co.uk"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="luxury-input"
          />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Telephone / WhatsApp (with country code) *
          </label>
          <input
            type="tel"
            placeholder="e.g. +44 20 7946 0912"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="luxury-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
            Preferred Communication Channel *
          </label>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value as any })}
            className="luxury-select"
          >
            <option value="email">Encrypted Email Dossier</option>
            <option value="whatsapp">Confidential WhatsApp Messaging</option>
            <option value="phone">Direct Telephone Call with Charter Director</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
          Additional Notes or Confidentiality Instructions
        </label>
        <textarea
          rows={3}
          placeholder="Specify timing for calls, representative contacts, or preliminary NDA needs..."
          value={formData.additionalMessage}
          onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
          className="luxury-input"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0a121e', padding: '1rem', border: '1px solid rgba(198, 167, 106, 0.2)' }}>
        <ShieldCheck size={20} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          All data submitted is protected under stringent non-disclosure compliance. We never share principal identities with third-party suppliers without advance consent.
        </div>
      </div>
    </div>
  );
}

