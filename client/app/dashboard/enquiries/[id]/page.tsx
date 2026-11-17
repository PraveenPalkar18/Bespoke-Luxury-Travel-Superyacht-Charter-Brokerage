'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  Compass,
  Plane,
  Anchor,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  FileText,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../../lib/authContext';
import {
  fetchInquiryById,
  updateInquiryApi,
  addInquiryNoteApi,
  fetchBrokers,
  fetchProposalsByInquiry,
  sendProposalApi,
} from '../../../../lib/api';
import { IInquiry, InquiryStatus, InquiryPriority, IProposal } from '../../../../types';
import CreateProposalModal from '../../../../components/dashboard/CreateProposalModal';

export default function EnquiryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { token, user } = useAuth();

  const [inquiry, setInquiry] = useState<IInquiry | null>(null);
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);

  // Proposal modal & link copying
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [copiedProposalId, setCopiedProposalId] = useState<string | null>(null);
  const [sendingProposalId, setSendingProposalId] = useState<string | null>(null);

  // Note Form
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<'internal' | 'supplier' | 'customer_call'>('internal');
  const [addingNote, setAddingNote] = useState<boolean>(false);

  // Supplier Notes
  const [supplierNotes, setSupplierNotes] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      if (!token || !id) return;
      try {
        const [inqData, brokersData, proposalsData] = await Promise.all([
          fetchInquiryById(token, id),
          fetchBrokers(token),
          fetchProposalsByInquiry(token, id).catch(() => []),
        ]);
        setInquiry(inqData);
        setSupplierNotes(inqData.supplierNotes || '');
        setBrokers(brokersData);
        setProposals(proposalsData || []);
      } catch (err: any) {
        console.error('Failed to load dossier:', err);
        if (err.statusCode === 403 || err.status === 403) {
          setAccessDeniedError(
            err.message || 'Access denied: You are not authorized to view this confidential enquiry.'
          );
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, id]);

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!token || !inquiry) return;
    setUpdating(true);
    try {
      const updated = await updateInquiryApi(token, inquiry._id, { status: newStatus });
      setInquiry(updated);
      setSuccessMsg(`Status updated to "${newStatus.replace('_', ' ')}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleBrokerAssign = async (brokerId: string) => {
    if (!token || !inquiry) return;
    const selectedBroker = brokers.find((b) => b.id === brokerId);
    setUpdating(true);
    try {
      const updated = await updateInquiryApi(token, inquiry._id, {
        assignedTo: brokerId,
        assignedBrokerName: selectedBroker?.name || 'Assigned Broker',
      });
      setInquiry(updated);
      setSuccessMsg(`Assigned to ${selectedBroker?.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to assign broker:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSupplierNotes = async () => {
    if (!token || !inquiry) return;
    setUpdating(true);
    try {
      const updated = await updateInquiryApi(token, inquiry._id, {
        supplierNotes,
      });
      setInquiry(updated);
      setSuccessMsg('Supplier correspondence notes saved');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save supplier notes:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !inquiry || !noteContent.trim()) return;

    setAddingNote(true);
    try {
      const updated = await addInquiryNoteApi(token, inquiry._id, noteContent.trim(), noteCategory);
      setInquiry(updated);
      setNoteContent('');
      setSuccessMsg('Internal broker note recorded');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    if (!token) return;
    setSendingProposalId(proposalId);
    try {
      const sent = await sendProposalApi(token, proposalId);
      setProposals(proposals.map((p) => (p._id === proposalId ? sent : p)));
      if (inquiry) {
        setInquiry({ ...inquiry, status: 'quote_sent' });
      }
      setSuccessMsg(`Proposal ${sent.referenceCode} dispatched to client!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to dispatch proposal:', err);
      alert(err.message || 'Failed to dispatch proposal');
    } finally {
      setSendingProposalId(null);
    }
  };

  const handleCopyLink = (tokenStr: string, propId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const clientUrl = `${origin}/proposal/${tokenStr}`;
    navigator.clipboard.writeText(clientUrl);
    setCopiedProposalId(propId);
    setSuccessMsg('Private client presentation link copied to clipboard!');
    setTimeout(() => {
      setCopiedProposalId(null);
      setSuccessMsg('');
    }, 3000);
  };

  const handleProposalCreated = (newProposal: IProposal) => {
    setProposals([newProposal, ...proposals]);
    setSuccessMsg(`Proposal ${newProposal.referenceCode} created.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (loading) {
    return <div style={{ color: 'var(--color-gold)', padding: '4rem 0' }}>Retrieving enquiry dossier...</div>;
  }

  if (accessDeniedError) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Lock size={30} />
        </div>
        <div className="gold-label" style={{ marginBottom: '0.5rem' }}>Confidential Client Dossier</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Access Restricted &bull; HTTP 403
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '2rem' }}>
          {accessDeniedError}
        </p>
        <a href="/dashboard/enquiries" className="btn-gold" style={{ fontSize: '0.825rem' }}>
          Return to My Assigned Pipeline
        </a>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff' }}>Enquiry Dossier Not Found</h2>
        <a href="/dashboard/enquiries" className="btn-outline-gold" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Back to Pipeline
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navigation & Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="/dashboard/enquiries"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94a3b8',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
            }}
          >
            <ArrowLeft size={16} /> Pipeline
          </a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-gold)', fontWeight: 600 }}>
            {inquiry.referenceCode}
          </span>
          <span className="badge-navy" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Logged: {new Date(inquiry.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {successMsg && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#86efac',
                padding: '0.4rem 1rem',
                borderRadius: '2px',
                fontSize: '0.8rem',
              }}
            >
              {successMsg}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className="btn-gold"
            style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={15} /> Generate Bespoke Proposal
          </button>
        </div>
      </div>

      {/* Bespoke Proposals & Itineraries Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            background: '#0d1624',
            border: '1px solid rgba(198, 167, 106, 0.3)',
            borderRadius: '2px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="gold-label" style={{ marginBottom: '0.2rem' }}>
                Client Proposals &amp; Quotations Engine
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                Bespoke Itineraries &amp; Quotations ({proposals.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsProposalModalOpen(true)}
              className="btn-outline-gold"
              style={{ fontSize: '0.75rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} /> New Quotation
            </button>
          </div>

          {proposals.length === 0 ? (
            <div
              style={{
                background: '#101c2c',
                border: '1px dashed rgba(198, 167, 106, 0.25)',
                borderRadius: '2px',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                <FileText size={32} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem' }}>
                No Proposals Created Yet
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                Construct a tailored quotation with private jet flight legs, superyacht days, and a day-by-day itinerary for {inquiry.customerName}.
              </p>
              <button
                type="button"
                onClick={() => setIsProposalModalOpen(true)}
                className="btn-gold"
                style={{ fontSize: '0.78rem' }}
              >
                + Create First Bespoke Proposal
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {proposals.map((prop) => (
                <div
                  key={prop._id}
                  style={{
                    background: '#101c2c',
                    border: '1px solid rgba(198, 167, 106, 0.25)',
                    borderRadius: '2px',
                    padding: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '1.5rem',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {prop.referenceCode}
                      </span>
                      <span
                        className={
                          prop.status === 'accepted'
                            ? 'badge-gold'
                            : prop.status === 'viewed'
                            ? 'badge-navy'
                            : 'badge-navy'
                        }
                        style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
                      >
                        {prop.status}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {prop.itinerary.length} Days Itinerary
                      </span>
                    </div>

                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                      {prop.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {prop.aircraft ? `✈ ${prop.aircraft.name} • ` : ''}
                      {prop.yacht ? `⚓ ${prop.yacht.name} (${prop.yacht.lengthFeet}ft) • ` : ''}
                      Valid until {new Date(prop.validUntil).toLocaleDateString()}
                    </div>

                    {prop.clientFeedback?.decision && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: prop.clientFeedback.decision === 'accepted' ? '#86efac' : '#fde047',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '2px',
                          display: 'inline-block',
                        }}
                      >
                        Client Response: <strong style={{ textTransform: 'uppercase' }}>{prop.clientFeedback.decision.replace('_', ' ')}</strong>
                        {prop.clientFeedback.clientNotes ? ` &bull; "${prop.clientFeedback.clientNotes}"` : ''}
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                      Estimated Quotation
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      ${prop.pricing.totalEstimatedCost.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>
                      {prop.pricing.currency} All-Inclusive
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                      Created By
                    </span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                      {prop.createdByName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                    {prop.status === 'draft' && (
                      <button
                        type="button"
                        disabled={sendingProposalId === prop._id}
                        onClick={() => handleSendProposal(prop._id)}
                        className="btn-gold"
                        style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <Send size={13} /> {sendingProposalId === prop._id ? 'Sending...' : 'Dispatch to Client'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyLink(prop.clientAccessToken, prop._id)}
                      className="btn-outline-gold"
                      style={{ fontSize: '0.725rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      {copiedProposalId === prop._id ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
                      {copiedProposalId === prop._id ? 'Link Copied!' : 'Copy Client Link'}
                    </button>

                    <a
                      href={`/proposal/${prop.clientAccessToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.725rem',
                        color: '#94a3b8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none',
                        padding: '0.3rem',
                      }}
                    >
                      <ExternalLink size={12} /> Preview Portal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Dossier Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
        {/* Left Column: Requirements & Status Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Status & Allocation Card */}
          <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
            <div className="gold-label" style={{ marginBottom: '1rem' }}>
              Dossier Workflow State
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Current Status
                </label>
                <select
                  value={inquiry.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                  className="luxury-select"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1rem' }}
                >
                  <option value="new">New Request (Action Required)</option>
                  <option value="in_review">In Review by Broker</option>
                  <option value="supplier_contacted">Supplier Sourcing in Progress</option>
                  <option value="quote_sent">Quotation Dossier Sent to Client</option>
                  <option value="negotiating">Negotiating Terms / Dates</option>
                  <option value="confirmed">Charter Confirmed &amp; Contracted</option>
                  <option value="archived">Archived / Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Assigned Broker Specialist
                </label>
                <select
                  value={inquiry.assignedTo || ''}
                  disabled={updating}
                  onChange={(e) => handleBrokerAssign(e.target.value)}
                  className="luxury-select"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1rem' }}
                >
                  <option value="">-- Unassigned --</option>
                  {brokers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.role === 'admin' ? 'Admin' : 'Broker'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Profile & Requirements */}
          <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
            <div className="gold-label" style={{ marginBottom: '1rem' }}>
              Client Principal &amp; Contact Profile
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Client Principal Name</div>
                <div style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600 }}>{inquiry.customerName}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Preferred Contact Channel</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-gold)', textTransform: 'capitalize' }}>
                  {inquiry.preferredContactMethod}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Email Address</div>
                <a href={`mailto:${inquiry.email}`} style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                  {inquiry.email}
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Direct Telephone</div>
                <a href={`tel:${inquiry.phone}`} style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                  {inquiry.phone}
                </a>
              </div>
            </div>

            <div className="gold-label" style={{ marginBottom: '1rem' }}>
              Expedition Specification
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Origin &bull; Departure</div>
                <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{inquiry.departureLocation}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Primary Destination</div>
                <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{inquiry.destination}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Departure Schedule</div>
                <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                  {inquiry.departureDate} {inquiry.returnDate ? `&rarr; ${inquiry.returnDate}` : ''}
                </div>
                {inquiry.isFlexibleDates && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>Dates Flexible (+/- 3 days)</span>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Principal Party Size</div>
                <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{inquiry.travellers} Guests</div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Indicated Budget Bracket</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-gold)', fontWeight: 600 }}>{inquiry.budgetRange}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Charter Disciplines</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  {inquiry.requestedServices.map((svc) => (
                    <span key={svc} className="badge-navy" style={{ fontSize: '0.65rem' }}>
                      {svc.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {inquiry.specialRequests && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Special Concierge &amp; Aviation Instructions
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{inquiry.specialRequests}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Internal Broker Notes & Supplier Communications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Internal Broker Notes */}
          <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="gold-label">Internal Private Audit</div>
              <span className="badge-navy" style={{ fontSize: '0.65rem' }}>Strictly Confidential</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '1.25rem' }}>
              Broker Timeline &amp; Discussion Notes
            </h3>

            {/* Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {inquiry.internalNotes && inquiry.internalNotes.length > 0 ? (
                inquiry.internalNotes.map((note) => (
                  <div
                    key={note._id}
                    style={{
                      background: '#142236',
                      padding: '1rem',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {note.authorName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {new Date(note.createdAt).toLocaleDateString()} &bull; {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      {note.content}
                    </div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <span
                        className="badge-navy"
                        style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}
                      >
                        {note.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
                  No internal notes recorded yet for this dossier.
                </div>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="luxury-select"
                  style={{ width: 'auto', fontSize: '0.75rem', padding: '0.45rem 1.75rem 0.45rem 0.75rem' }}
                >
                  <option value="internal">Internal Strategy Note</option>
                  <option value="supplier">Supplier Communication</option>
                  <option value="customer_call">Client Phone Call</option>
                </select>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Log internal charter conversation, supplier price quote, or FBO handling notes..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="luxury-input"
                style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
              />

              <button
                type="submit"
                disabled={addingNote || !noteContent.trim()}
                className="btn-gold"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
              >
                {addingNote ? 'Recording Log...' : 'Record Memorandum'}
              </button>
            </form>
          </div>

          {/* Supplier Communications & Operator Quotations */}
          <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
            <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
              Supplier Management
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '1rem' }}>
              Aviation &amp; Maritime Supplier Records
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1rem' }}>
              Maintain confidential operator quotes, tail numbers, broker commission agreements, and harbor master berths.
            </p>

            <textarea
              rows={4}
              placeholder="e.g. VistaJet tail 9H-VJC quoted $14,200/hr. Farnborough slot confirmed for 14:00z. Port Hercule quay berth requested from Monaco Harbor Authority..."
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              className="luxury-input"
              style={{ fontSize: '0.85rem', marginBottom: '1rem' }}
            />

            <button
              type="button"
              onClick={handleSaveSupplierNotes}
              disabled={updating}
              className="btn-outline-gold"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
            >
              Update Supplier Records
            </button>
          </div>
        </div>
      </div>

      {/* Proposal Creation Modal */}
      {inquiry && (
        <CreateProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          inquiry={inquiry}
          token={token || ''}
          onCreated={handleProposalCreated}
        />
      )}
    </div>
  );
}
