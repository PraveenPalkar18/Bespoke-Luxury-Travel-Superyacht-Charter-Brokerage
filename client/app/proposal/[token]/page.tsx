'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plane,
  Anchor,
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Printer,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { fetchPublicProposal, respondToPublicProposal } from '../../../lib/api';
import { IProposal } from '../../../types';

export default function PublicProposalPresentationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [proposal, setProposal] = useState<IProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Client response form state
  const [decision, setDecision] = useState<'accepted' | 'declined' | 'requested_changes' | null>(null);
  const [clientNotes, setClientNotes] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseSuccessMsg, setResponseSuccessMsg] = useState('');

  useEffect(() => {
    async function loadProposal() {
      if (!token) return;
      try {
        const data = await fetchPublicProposal(token);
        setProposal(data);
        if (data.clientFeedback?.decision) {
          setDecision(data.clientFeedback.decision);
        }
      } catch (err: any) {
        console.error('Failed to load luxury proposal:', err);
        setErrorMsg(err.message || 'Unable to retrieve private proposal.');
      } finally {
        setLoading(false);
      }
    }
    loadProposal();
  }, [token]);

  const handleRespond = async (chosenDecision: 'accepted' | 'declined' | 'requested_changes') => {
    if (!token) return;
    setSubmittingResponse(true);
    try {
      const updated = await respondToPublicProposal(token, chosenDecision, clientNotes);
      setProposal(updated);
      setDecision(chosenDecision);
      setResponseSuccessMsg(
        chosenDecision === 'accepted'
          ? 'Thank you. Your proposal acceptance has been confirmed. Your Charter Director will prepare your formal charter agreement.'
          : 'Thank you. Your notes have been transmitted to your dedicated Charter Director.'
      );
    } catch (err: any) {
      console.error('Failed to submit response:', err);
      alert(err.message || 'Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#09101a',
          color: 'var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.4rem',
        }}
      >
        Decrypting Bespoke Charter Dossier...
      </div>
    );
  }

  if (errorMsg || !proposal) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#09101a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>
          <ShieldCheck size={48} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Confidential Charter Dossier
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '2rem' }}>
          {errorMsg || 'This private travel proposal is no longer available or the access link has expired.'}
        </p>
        <a href="/" className="btn-gold" style={{ fontSize: '0.85rem' }}>
          Return to Aurelia &amp; Co.
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#070d15',
        color: '#f7f5f0',
        minHeight: '100vh',
        paddingTop: '5rem',
        paddingBottom: '5rem',
      }}
    >
      <div className="container-luxury" style={{ maxWidth: '1020px' }}>
        {/* Top Control Bar (Non-print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
            paddingBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Bespoke Proposal Ref:
            </span>
            <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              {proposal.referenceCode}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handlePrint}
              className="btn-outline-gold"
              style={{ fontSize: '0.75rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <span
              className={proposal.status === 'accepted' ? 'badge-gold' : 'badge-navy'}
              style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}
            >
              {proposal.status === 'accepted' ? 'Contract Confirmed' : `Status: ${proposal.status}`}
            </span>
          </div>
        </div>

        {/* Cinematic Proposal Cover Hero */}
        <div
          style={{
            background: 'linear-gradient(rgba(10, 18, 30, 0.75), rgba(7, 13, 21, 0.98)), url("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(198, 167, 106, 0.35)',
            borderRadius: '2px',
            padding: '4rem 3rem',
            marginBottom: '3rem',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="gold-label" style={{ marginBottom: '1rem' }}>
            Curated Private Journey &bull; {proposal.destination}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3rem',
              color: '#ffffff',
              letterSpacing: '0.02em',
              marginBottom: '1rem',
              lineHeight: 1.15,
            }}
          >
            {proposal.title}
          </h1>
          <div className="gold-divider center" style={{ margin: '1.5rem auto' }} />
          <div style={{ fontSize: '1.05rem', color: '#cbd5e1', letterSpacing: '0.05em' }}>
            Prepared exclusively for <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{proposal.clientName}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Charter Director: {proposal.createdByName} &bull; Valid through {new Date(proposal.validUntil).toLocaleDateString()}
          </div>
        </div>

        {/* Director's Welcome & Executive Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              background: '#0d1624',
              border: '1px solid rgba(198, 167, 106, 0.25)',
              padding: '2.5rem',
              borderRadius: '2px',
            }}
          >
            <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
              Expedition Overview
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>
              Executive Summary
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '0.95rem' }}>
              {proposal.executiveSummary}
            </p>
          </div>

          <div
            style={{
              background: '#0d1624',
              border: '1px solid rgba(198, 167, 106, 0.25)',
              padding: '2.5rem',
              borderRadius: '2px',
              borderLeft: '3px solid var(--color-gold)',
            }}
          >
            <div className="gold-label" style={{ marginBottom: '0.75rem' }}>
              Charter Director Letter
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>
              Personal Memorandum
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              &ldquo;{proposal.brokerPersonalNote}&rdquo;
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600 }}>
              {proposal.createdByName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Senior Charter Specialist &bull; Aurelia &amp; Co. Private Brokerage
            </div>
          </div>
        </div>

        {/* Selected Fleet Assets Presentation */}
        {(proposal.aircraft || proposal.yacht) && (
          <div style={{ marginBottom: '4rem' }}>
            <div className="gold-label" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
              Sovereign Transportation
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '2.5rem',
              }}
            >
              Curated Fleet Assets
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {/* Aircraft Card */}
              {proposal.aircraft && (
                <div
                  style={{
                    background: '#0d1624',
                    border: '1px solid rgba(198, 167, 106, 0.25)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {proposal.aircraft.featuredImage && (
                    <div style={{ height: '220px', position: 'relative' }}>
                      <img
                        src={proposal.aircraft.featuredImage}
                        alt={proposal.aircraft.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'rgba(7, 13, 21, 0.85)',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '2px',
                          border: '1px solid var(--color-gold)',
                          color: 'var(--color-gold)',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        Private Aviation
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {proposal.aircraft.category}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: '0.4rem 0 1.25rem 0' }}>
                      {proposal.aircraft.name}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', fontSize: '0.825rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Departure FBO</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.aircraft.departureFBO || 'Private Executive Ramp'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Arrival FBO</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.aircraft.arrivalFBO || proposal.destination}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Flight Time</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.aircraft.flightHours ? `${proposal.aircraft.flightHours} hrs non-stop` : 'Direct Routing'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Principal Delegation</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.aircraft.passengerCount || 8} Guests VIP Config</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Yacht Card */}
              {proposal.yacht && (
                <div
                  style={{
                    background: '#0d1624',
                    border: '1px solid rgba(198, 167, 106, 0.25)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {proposal.yacht.featuredImage && (
                    <div style={{ height: '220px', position: 'relative' }}>
                      <img
                        src={proposal.yacht.featuredImage}
                        alt={proposal.yacht.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'rgba(7, 13, 21, 0.85)',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '2px',
                          border: '1px solid var(--color-gold)',
                          color: 'var(--color-gold)',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        Superyacht Charter
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {proposal.yacht.builder} &bull; {proposal.yacht.lengthFeet} ft
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: '0.4rem 0 1.25rem 0' }}>
                      {proposal.yacht.name}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', fontSize: '0.825rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Embarkation Port</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.yacht.embarkationPort}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Disembarkation</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.yacht.disembarkationPort}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Charter Period</span>
                        <span style={{ color: '#cbd5e1' }}>{proposal.yacht.charterDays} Days Exclusive</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>Full Crew Complement</span>
                        <span style={{ color: '#cbd5e1' }}>Michelin Chef &amp; Service Team</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Day-by-Day Interactive Itinerary */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div className="gold-label" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            Chronological Waypoints
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            Day-by-Day Bespoke Itinerary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {proposal.itinerary.map((day) => (
              <div
                key={day.dayNumber}
                style={{
                  background: '#0d1624',
                  border: '1px solid rgba(198, 167, 106, 0.2)',
                  borderRadius: '2px',
                  padding: '2rem 2.5rem',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '2rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'rgba(198, 167, 106, 0.1)',
                      border: '1px solid var(--color-gold)',
                      color: 'var(--color-gold)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                    }}
                  >
                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DAY</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1 }}>
                      {day.dayNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#ffffff', margin: 0 }}>
                      {day.title}
                    </h3>
                    <span className="badge-navy" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                      {day.location}
                    </span>
                  </div>

                  <p style={{ color: '#cbd5e1', lineHeight: '1.75', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                    {day.description}
                  </p>

                  {day.highlights && day.highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {day.highlights.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.78rem',
                            color: 'var(--color-gold)',
                            background: 'rgba(198, 167, 106, 0.08)',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '2px',
                          }}
                        >
                          <CheckCircle2 size={13} /> {h}
                        </div>
                      ))}
                    </div>
                  )}

                  {day.accommodation && (
                    <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b' }}>
                      Accommodation / Overnight: <span style={{ color: '#94a3b8' }}>{day.accommodation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotation Breakdown & Inclusions */}
        <div
          style={{
            background: '#0d1624',
            border: '1px solid rgba(198, 167, 106, 0.35)',
            borderRadius: '2px',
            padding: '3rem',
            marginBottom: '4rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
            Financial Breakdown
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', marginBottom: '2rem' }}>
            Transparent Quotation Matrix
          </h2>

          <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                {proposal.pricing.aircraftCharterPrice ? (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0', color: '#cbd5e1' }}>Private Aviation Charter (Fuel, Landing Fees &amp; Crew)</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      ${proposal.pricing.aircraftCharterPrice.toLocaleString()} {proposal.pricing.currency}
                    </td>
                  </tr>
                ) : null}

                {proposal.pricing.yachtCharterPrice ? (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0', color: '#cbd5e1' }}>Superyacht Charter Fee (Vessel, Equipment &amp; Crew Services)</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      ${proposal.pricing.yachtCharterPrice.toLocaleString()} {proposal.pricing.currency}
                    </td>
                  </tr>
                ) : null}

                {proposal.pricing.estimatedAPA ? (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0', color: '#cbd5e1' }}>Estimated APA (Advance Provisioning Allowance &bull; Fuel, Dockage, Food &amp; Beverages)</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      ${proposal.pricing.estimatedAPA.toLocaleString()} {proposal.pricing.currency}
                    </td>
                  </tr>
                ) : null}

                {proposal.pricing.conciergeAndCrewGratuity ? (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0', color: '#cbd5e1' }}>Bespoke Concierge Coordination &amp; Crew Service Allocation</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      ${proposal.pricing.conciergeAndCrewGratuity.toLocaleString()} {proposal.pricing.currency}
                    </td>
                  </tr>
                ) : null}

                {proposal.pricing.taxesAndFees ? (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem 0', color: '#cbd5e1' }}>Port Dues, FBO Passenger Handling &amp; Marine Taxes</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      ${proposal.pricing.taxesAndFees.toLocaleString()} {proposal.pricing.currency}
                    </td>
                  </tr>
                ) : null}

                <tr style={{ borderTop: '2px solid var(--color-gold)' }}>
                  <td style={{ padding: '1.5rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff' }}>
                    Total Estimated Quotation
                  </td>
                  <td style={{ padding: '1.5rem 0', textAlign: 'right', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                    ${proposal.pricing.totalEstimatedCost.toLocaleString()} {proposal.pricing.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inclusions & Terms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Charter Inclusions
              </div>
              <ul style={{ paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8' }}>
                {proposal.inclusions.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Payment &amp; Confirmation Terms
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8' }}>
                {proposal.paymentTerms}
              </p>
            </div>
          </div>
        </div>

        {/* Client Decision & Action Console (Non-print) */}
        <div
          className="no-print"
          style={{
            background: '#0d1624',
            border: '1px solid rgba(198, 167, 106, 0.4)',
            borderRadius: '2px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          {responseSuccessMsg ? (
            <div style={{ padding: '2rem 0' }}>
              <div style={{ color: '#4ade80', marginBottom: '1rem' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                {decision === 'accepted' ? 'Charter Agreement Requested' : 'Response Registered'}
              </h3>
              <p style={{ color: '#cbd5e1', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                {responseSuccessMsg}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                Your Charter Director {proposal.createdByName} has received your direct instructions.
              </div>
            </div>
          ) : (
            <div>
              <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
                Principal Decision
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#ffffff', marginBottom: '1rem' }}>
                Confirm Your Bespoke Expedition
              </h3>
              <p style={{ color: '#94a3b8', maxWidth: '580px', margin: '0 auto 2rem auto', fontSize: '0.9rem' }}>
                To proceed with this bespoke charter, accept the quotation below to receive your formal MYBA/Aviation Charter Agreement, or submit refinements directly to your broker.
              </p>

              <div style={{ maxWidth: '580px', margin: '0 auto 2rem auto' }}>
                <textarea
                  rows={2}
                  className="luxury-input"
                  placeholder="Optional notes, dietary requirements, or adjustment requests for your broker..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  style={{ textAlign: 'left', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={submittingResponse}
                  onClick={() => handleRespond('accepted')}
                  className="btn-gold"
                  style={{ padding: '0.85rem 2rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FileCheck size={18} /> Accept Proposal &amp; Request Contract
                </button>

                <button
                  type="button"
                  disabled={submittingResponse}
                  onClick={() => handleRespond('requested_changes')}
                  className="btn-outline-gold"
                  style={{ padding: '0.85rem 2rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MessageSquare size={16} /> Request Adjustments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer brand signature */}
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b', fontSize: '0.75rem' }}>
          <div>AURELIA &amp; CO. &bull; MONACO &bull; LONDON &bull; NEW YORK &bull; DUBAI</div>
          <div style={{ marginTop: '0.25rem' }}>Confidential Client Presentation &bull; All Rights Reserved</div>
        </div>
      </div>
    </div>
  );
}

