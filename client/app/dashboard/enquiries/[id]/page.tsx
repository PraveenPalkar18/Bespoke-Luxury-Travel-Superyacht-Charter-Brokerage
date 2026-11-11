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
} from 'lucide-react';
import { useAuth } from '../../../../lib/authContext';
import {
  fetchInquiryById,
  updateInquiryApi,
  addInquiryNoteApi,
  fetchBrokers,
} from '../../../../lib/api';
import { IInquiry, InquiryStatus, InquiryPriority } from '../../../../types';

export default function EnquiryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { token, user } = useAuth();

  const [inquiry, setInquiry] = useState<IInquiry | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

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
        const [inqData, brokersData] = await Promise.all([
          fetchInquiryById(token, id),
          fetchBrokers(token),
        ]);
        setInquiry(inqData);
        setSupplierNotes(inqData.supplierNotes || '');
        setBrokers(brokersData);
      } catch (err) {
        console.error('Failed to load dossier:', err);
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

  if (loading) {
    return <div style={{ color: 'var(--color-gold)', padding: '4rem 0' }}>Retrieving enquiry dossier...</div>;
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
      {/* Top Navigation & Ref */}
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
                  <option value="confirmed">Charter Confirmed & Contracted</option>
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
              Client Principal & Contact Profile
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Client Principal Name</div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', marginTop: '0.2rem' }}>
                  {inquiry.customerName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Preferred Contact Channel</div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  {inquiry.preferredContactMethod}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Direct Email</div>
                <a href={`mailto:${inquiry.email}`} style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem', display: 'block' }}>
                  {inquiry.email}
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Direct Phone / WhatsApp</div>
                <a href={`tel:${inquiry.phone}`} style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem', display: 'block' }}>
                  {inquiry.phone}
                </a>
              </div>
            </div>

            <div className="gold-label" style={{ marginBottom: '1rem' }}>
              Charter Itinerary Specifications
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Departure Point</div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {inquiry.departureLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Destination Grounds</div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {inquiry.destination}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Departure Date</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  {inquiry.departureDate} {inquiry.isFlexibleDates && '(Flexible +/-3d)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Return Date</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  {inquiry.returnDate || 'One-Way / Open'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Party Size</div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {inquiry.travellers} Guests
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase' }}>Indicated Budget</div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>
                  {inquiry.budgetRange}
                </div>
              </div>
            </div>

            {/* Requested Services */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Requested Services
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {inquiry.requestedServices.map((srv, i) => (
                  <span key={i} className="badge-gold">
                    {srv.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferences Tags */}
            {inquiry.travelPreferences && inquiry.travelPreferences.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Special Preferences & Attributes
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {inquiry.travelPreferences.map((p, i) => (
                    <span key={i} className="badge-navy">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {inquiry.specialRequests && (
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Client Instructions & Notes
                </div>
                <div style={{ background: '#080e18', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {inquiry.specialRequests}
                </div>
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
              Broker Timeline & Discussion Notes
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
                placeholder="Log operator pricing, yacht berth confirmation, or customer call notes..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="luxury-input"
                style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
              />

              <button
                type="submit"
                disabled={addingNote}
                className="btn-gold"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
              >
                {addingNote ? 'Recording Note...' : 'Record Private Broker Note'}
              </button>
            </form>
          </div>

          {/* Supplier Direct Log */}
          <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
            <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
              Supplier Coordination
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Operator & Port Handling Records
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
              Record operator names, tail/hull registrations, provisional slot codes, and FBO handling agreements.
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
    </div>
  );
}

