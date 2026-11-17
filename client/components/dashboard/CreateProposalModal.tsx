'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Plane,
  Anchor,
  Compass,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import { IInquiry, IAircraft, IYacht } from '../../types';
import { createProposalApi, fetchAircraft, fetchYachts } from '../../lib/api';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: IInquiry;
  token: string;
  onCreated: (proposal: any) => void;
}

export default function CreateProposalModal({
  isOpen,
  onClose,
  inquiry,
  token,
  onCreated,
}: CreateProposalModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Available fleet for selection
  const [jets, setJets] = useState<IAircraft[]>([]);
  const [yachts, setYachts] = useState<IYacht[]>([]);

  // Form State
  const [title, setTitle] = useState(
    `The Sovereign ${inquiry.destination} Bespoke Expedition`
  );
  const [destination, setDestination] = useState(inquiry.destination);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [executiveSummary, setExecutiveSummary] = useState(
    `A curated ultra-luxury private charter expedition tailored for ${inquiry.customerName}. Featuring seamless private air transit and sovereign yacht cruising across ${inquiry.destination}.`
  );
  const [brokerPersonalNote, setBrokerPersonalNote] = useState(
    `Dear ${inquiry.customerName}, following your brief, our charter desk has secured prime fleet availability and curated this bespoke itinerary for your consideration.`
  );

  // Selected Assets
  const [selectedJetId, setSelectedJetId] = useState('');
  const [jetDepartureFBO, setJetDepartureFBO] = useState(inquiry.departureLocation);
  const [jetArrivalFBO, setJetArrivalFBO] = useState(inquiry.destination);

  const [selectedYachtId, setSelectedYachtId] = useState('');
  const [yachtEmbarkation, setYachtEmbarkation] = useState(inquiry.destination);
  const [yachtDisembarkation, setYachtDisembarkation] = useState(inquiry.destination);
  const [yachtDays, setYachtDays] = useState(7);

  // Pricing
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [aircraftPrice, setAircraftPrice] = useState<number>(
    inquiry.requestedServices.includes('private_jet') || inquiry.requestedServices.includes('both')
      ? 65000
      : 0
  );
  const [yachtPrice, setYachtPrice] = useState<number>(
    inquiry.requestedServices.includes('superyacht') || inquiry.requestedServices.includes('both')
      ? 280000
      : 0
  );
  const [apaPrice, setApaPrice] = useState<number>(85000);
  const [conciergeFee, setConciergeFee] = useState<number>(25000);
  const [taxesFees, setTaxesFees] = useState<number>(15000);

  // Itinerary Days
  const [itineraryDays, setItineraryDays] = useState([
    {
      dayNumber: 1,
      title: 'Private Aviation Arrival & Sovereign Reception',
      location: `${inquiry.departureLocation} to ${inquiry.destination}`,
      description: `Private terminal boarding with zero wait time. Non-stop flight arriving in ${inquiry.destination} with direct VIP apron chauffeur transfer.`,
      highlights: ['VIP ramp limousine escort', 'Welcome Champagne vintage tasting'],
      transportMode: 'private_jet' as const,
    },
    {
      dayNumber: 2,
      title: 'Yacht Embarkation & Coastal Sunset Anchorage',
      location: inquiry.destination,
      description: `Boarding your private charter vessel. Settle into master suites followed by sunset cruising and an executive chef tasting dinner on the bridge deck.`,
      highlights: ['Helipad or tender boarding', 'Seven-course seafood gala dinner'],
      transportMode: 'superyacht' as const,
    },
    {
      dayNumber: 3,
      title: 'Marine Exploration & Secluded Cove Anchorage',
      location: `${inquiry.destination} Archipelagos`,
      description: `Morning aquatic toys setup (Fliteboard, Seabobs, tender excursions). Afternoon private island anchorage and gourmet beach club dinner.`,
      highlights: ['Full watersports suite', 'Private beach cabana reservation'],
      transportMode: 'leisure' as const,
    },
  ]);

  // Load Fleet for asset picker
  useEffect(() => {
    async function loadFleet() {
      try {
        const [jetsData, yachtsData] = await Promise.all([fetchAircraft(), fetchYachts()]);
        setJets(jetsData || []);
        setYachts(yachtsData || []);
      } catch (err) {
        console.error('Failed to load fleet for proposal modal:', err);
      }
    }
    if (isOpen) {
      loadFleet();
    }
  }, [isOpen]);

  // Update yacht APA automatically when yacht charter price changes
  const handleYachtPriceChange = (val: number) => {
    setYachtPrice(val);
    setApaPrice(Math.round(val * 0.3)); // standard 30% APA
  };

  const totalCost =
    (Number(aircraftPrice) || 0) +
    (Number(yachtPrice) || 0) +
    (Number(apaPrice) || 0) +
    (Number(conciergeFee) || 0) +
    (Number(taxesFees) || 0);

  const handleAddDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} — Bespoke Exploration`,
        location: destination,
        description: 'Bespoke leisure and luxury concierge excursions tailored to principal preferences.',
        highlights: ['Private local guide', 'Curated culinary experience'],
        transportMode: 'leisure' as const,
      },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    if (itineraryDays.length <= 1) return;
    const updated = itineraryDays
      .filter((_, idx) => idx !== index)
      .map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
    setItineraryDays(updated);
  };

  const handleUpdateDay = (index: number, field: string, value: any) => {
    const updated = [...itineraryDays];
    (updated[index] as any)[field] = value;
    setItineraryDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const selectedJet = jets.find((j) => j._id === selectedJetId);
      const selectedYacht = yachts.find((y) => y._id === selectedYachtId);

      const payload = {
        inquiryId: inquiry._id,
        title,
        destination,
        clientName: inquiry.customerName,
        clientEmail: inquiry.email,
        validUntil,
        executiveSummary,
        brokerPersonalNote,
        aircraft: selectedJet
          ? {
              aircraftId: selectedJet._id,
              name: selectedJet.name,
              model: selectedJet.model,
              category: selectedJet.category,
              departureFBO: jetDepartureFBO,
              arrivalFBO: jetArrivalFBO,
              flightHours: 3.5,
              passengerCount: inquiry.travellers,
              featuredImage: selectedJet.featuredImage,
            }
          : undefined,
        yacht: selectedYacht
          ? {
              yachtId: selectedYacht._id,
              name: selectedYacht.name,
              builder: selectedYacht.builder,
              lengthFeet: selectedYacht.lengthFeet,
              embarkationPort: yachtEmbarkation,
              disembarkationPort: yachtDisembarkation,
              charterDays: yachtDays,
              guestCount: inquiry.travellers,
              featuredImage: selectedYacht.featuredImage,
            }
          : undefined,
        itinerary: itineraryDays,
        pricing: {
          currency,
          aircraftCharterPrice: Number(aircraftPrice) || 0,
          yachtCharterPrice: Number(yachtPrice) || 0,
          estimatedAPA: Number(apaPrice) || 0,
          conciergeAndCrewGratuity: Number(conciergeFee) || 0,
          taxesAndFees: Number(taxesFees) || 0,
          totalEstimatedCost: totalCost,
        },
        inclusions: [
          'Direct VIP FBO private ramp coordination with zero terminal congestion',
          'Dedicated onboard chef and sommelier service throughout journey',
          '24/7 dedicated Aurelia & Co. Senior Charter Director supervision',
          'Full yacht tender and water toy equipment provisioning',
        ],
        exclusions: [
          'Ultra-rare vintage wine & spirit selections beyond allocated APA',
          'Personal onshore boutique purchases and gaming chips',
        ],
        paymentTerms:
          '50% deposit upon formal charter agreement execution. Balance and estimated APA due 30 days prior to departure.',
      };

      const created = await createProposalApi(token, payload);
      onCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create proposal:', err);
      setErrorMsg(err.message || 'Failed to generate proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#0d1624',
          border: '1px solid rgba(198, 167, 106, 0.35)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="gold-label" style={{ marginBottom: '0.2rem' }}>
              Quotation & Itinerary Builder
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                color: '#ffffff',
                margin: 0,
              }}
            >
              Generate Bespoke Proposal for {inquiry.customerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}
        >
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '2px',
                fontSize: '0.85rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Core Proposal Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                Proposal Title
              </label>
              <input
                type="text"
                required
                className="luxury-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                Quotation Valid Until
              </label>
              <input
                type="date"
                required
                className="luxury-input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Executive Summary (Presented in Client Portal)
            </label>
            <textarea
              required
              rows={3}
              className="luxury-input"
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
              Personal Letter from Charter Director
            </label>
            <textarea
              rows={2}
              className="luxury-input"
              value={brokerPersonalNote}
              onChange={(e) => setBrokerPersonalNote(e.target.value)}
            />
          </div>

          {/* Fleet Asset Selectors */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plane size={16} /> Private Jet &amp; Superyacht Allocation
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Jet Selection */}
              <div style={{ background: '#101c2c', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Allocated Private Aircraft
                </label>
                <select
                  className="luxury-input"
                  value={selectedJetId}
                  onChange={(e) => setSelectedJetId(e.target.value)}
                  style={{ marginBottom: '0.75rem' }}
                >
                  <option value="">-- No Private Jet Allocation --</option>
                  {jets.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.name} ({j.category} &bull; ${j.hourlyRateEstimate?.toLocaleString()}/hr)
                    </option>
                  ))}
                </select>

                {selectedJetId && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Departure FBO</span>
                      <input
                        type="text"
                        className="luxury-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={jetDepartureFBO}
                        onChange={(e) => setJetDepartureFBO(e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Arrival FBO</span>
                      <input
                        type="text"
                        className="luxury-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={jetArrivalFBO}
                        onChange={(e) => setJetArrivalFBO(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Yacht Selection */}
              <div style={{ background: '#101c2c', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Allocated Superyacht
                </label>
                <select
                  className="luxury-input"
                  value={selectedYachtId}
                  onChange={(e) => {
                    setSelectedYachtId(e.target.value);
                    const y = yachts.find((item) => item._id === e.target.value);
                    if (y && y.weeklyRateEstimate) {
                      handleYachtPriceChange(y.weeklyRateEstimate);
                    }
                  }}
                  style={{ marginBottom: '0.75rem' }}
                >
                  <option value="">-- No Superyacht Allocation --</option>
                  {yachts.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.name} ({y.builder} &bull; {y.lengthFeet}ft &bull; ${y.weeklyRateEstimate?.toLocaleString()}/wk)
                    </option>
                  ))}
                </select>

                {selectedYachtId && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Port of Embarkation</span>
                      <input
                        type="text"
                        className="luxury-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={yachtEmbarkation}
                        onChange={(e) => setYachtEmbarkation(e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Charter Days</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        className="luxury-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        value={yachtDays}
                        onChange={(e) => setYachtDays(parseInt(e.target.value, 10) || 7)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Day-by-Day Itinerary Builder */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={16} /> Day-by-Day Journey Itinerary
              </div>
              <button
                type="button"
                onClick={handleAddDay}
                className="btn-outline-gold"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={14} /> Add Itinerary Day
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {itineraryDays.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#101c2c',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      DAY {day.dayNumber}
                    </span>
                    {itineraryDays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(idx)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        title="Delete Day"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="Day Headline"
                      value={day.title}
                      onChange={(e) => handleUpdateDay(idx, 'title', e.target.value)}
                    />
                    <input
                      type="text"
                      className="luxury-input"
                      placeholder="Location"
                      value={day.location}
                      onChange={(e) => handleUpdateDay(idx, 'location', e.target.value)}
                    />
                    <select
                      className="luxury-input"
                      value={day.transportMode}
                      onChange={(e) => handleUpdateDay(idx, 'transportMode', e.target.value)}
                    >
                      <option value="private_jet">Private Jet</option>
                      <option value="superyacht">Superyacht</option>
                      <option value="helicopter">Helicopter</option>
                      <option value="chauffeur">Chauffeur</option>
                      <option value="leisure">Leisure / Anchorage</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    className="luxury-input"
                    placeholder="Editorial Narrative Description"
                    value={day.description}
                    onChange={(e) => handleUpdateDay(idx, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Quotation Matrix */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} /> Transparent Quotation Breakdown
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: '#101c2c', padding: '1.25rem', borderRadius: '2px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Aviation Charter ($)
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  value={aircraftPrice}
                  onChange={(e) => setAircraftPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Yacht Charter ($)
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  value={yachtPrice}
                  onChange={(e) => handleYachtPriceChange(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Estimated APA ($)
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  value={apaPrice}
                  onChange={(e) => setApaPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Concierge &amp; Crew ($)
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  value={conciergeFee}
                  onChange={(e) => setConciergeFee(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Taxes &amp; FBO ($)
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  value={taxesFees}
                  onChange={(e) => setTaxesFees(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Total Quotation Summary */}
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                background: 'rgba(198, 167, 106, 0.1)',
                border: '1px solid var(--color-gold)',
                borderRadius: '2px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Total Estimated Quotation ({currency})
                </span>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                  ${totalCost.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                All inclusive charter rate &bull; Subject to formal agreement
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-outline-gold"
              style={{ fontSize: '0.85rem' }}
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              {submitting ? 'Generating Proposal...' : 'Create Proposal & Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

