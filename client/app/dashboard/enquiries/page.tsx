'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  ChevronRight,
  Eye,
  Calendar,
  Users,
  Compass,
  Plane,
  Anchor,
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { fetchInquiries } from '../../../lib/api';
import { IInquiry, InquiryStatus } from '../../../types';

export default function EnquiriesManagementPage() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const statusOptions = [
    { label: 'All Requests', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'In Review', value: 'in_review' },
    { label: 'Supplier Contacted', value: 'supplier_contacted' },
    { label: 'Quote Sent', value: 'quote_sent' },
    { label: 'Confirmed', value: 'confirmed' },
  ];

  useEffect(() => {
    async function loadInquiries() {
      if (!token) return;
      setLoading(true);
      try {
        const data = await fetchInquiries(token, {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchQuery || undefined,
        });
        setInquiries(data);
      } catch (err) {
        console.error('Failed to load enquiries:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInquiries();
  }, [token, selectedStatus, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', borderRadius: '2px' }}>New Request</span>;
      case 'in_review':
        return <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', borderRadius: '2px' }}>Under Review</span>;
      case 'supplier_contacted':
        return <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', borderRadius: '2px' }}>Supplier Sourcing</span>;
      case 'quote_sent':
        return <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', borderRadius: '2px' }}>Dossier Sent</span>;
      case 'confirmed':
        return <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', borderRadius: '2px' }}>Confirmed</span>;
      default:
        return <span className="badge-navy">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="gold-label" style={{ marginBottom: '0.35rem' }}>
          Charter Pipeline
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
          Enquiry Management Dossiers
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
          Track customer requirements, update sourcing statuses, record internal broker notes, and log supplier discussions.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#0d1624',
          border: '1px solid rgba(198, 167, 106, 0.2)',
          padding: '1.25rem 1.75rem',
          borderRadius: '2px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                borderRadius: '2px',
                border: selectedStatus === opt.value ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedStatus === opt.value ? 'var(--color-gold)' : 'transparent',
                color: selectedStatus === opt.value ? '#09101a' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search ref, client, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="luxury-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', padding: '0.65rem 1rem 0.65rem 2.5rem' }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-gold)',
            }}
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-gold)' }}>
            Retrieving enquiry pipeline dossiers...
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            No client enquiries found matching criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Reference</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Client Principal</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Destination & Routing</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Travel Dates</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Services</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Budget</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Broker</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <td style={{ padding: '1rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      {item.referenceCode}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.customerName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.email}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.phone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.destination}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>From: {item.departureLocation}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.travellers} Guests</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      <div>{item.departureDate}</div>
                      {item.returnDate && <div style={{ color: '#64748b', fontSize: '0.75rem' }}>to {item.returnDate}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {item.requestedServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="badge-navy"
                            style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                          >
                            {srv.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#f7f5f0', fontWeight: 500 }}>
                      {item.budgetRange}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {item.assignedBrokerName ? (
                        <span style={{ color: 'var(--color-gold)', fontWeight: 500 }}>{item.assignedBrokerName}</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '0.75rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <a
                        href={`/dashboard/enquiries/${item._id}`}
                        className="btn-outline-gold"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.725rem' }}
                      >
                        Manage Dossier
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

