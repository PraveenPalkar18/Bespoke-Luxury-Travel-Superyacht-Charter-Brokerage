'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle,
  FileText,
  Plane,
  Anchor,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { fetchStats } from '../../lib/api';
import { IOverviewStats } from '../../types';

export default function DashboardOverviewPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<IOverviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      if (!token) return;
      try {
        const data = await fetchStats(token);
        setStats(data);
      } catch (err) {
        console.error('Error fetching broker stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

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

  if (loading) {
    return <div style={{ color: 'var(--color-gold)', padding: '3rem 0' }}>Loading brokerage metrics...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="gold-label" style={{ marginBottom: '0.35rem' }}>
            Brokerage Ops Terminal
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
            Executive Dashboard
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Active Session: {user?.name} &bull; {user?.title || 'Charter Specialist'}
          </div>
        </div>

        <a href="/dashboard/enquiries" className="btn-gold" style={{ fontSize: '0.78rem' }}>
          Open Full Enquiry Pipeline <ArrowRight size={14} />
        </a>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div style={{ background: '#0e1724', padding: '1.75rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Total Inquiries
            </span>
            <Inbox size={18} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#ffffff', lineHeight: 1 }}>
            {stats?.totalEnquiries ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
            All-time logged client requests
          </div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.75rem', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Action Needed (New)
            </span>
            <AlertCircle size={18} style={{ color: '#f87171' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#f87171', lineHeight: 1 }}>
            {stats?.newEnquiries ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
            Requires broker review & allocation
          </div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.75rem', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              In Sourcing / Active
            </span>
            <Clock size={18} style={{ color: '#facc15' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#fde047', lineHeight: 1 }}>
            {stats?.inProgressEnquiries ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
            Supplier quoting & negotiation
          </div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.75rem', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Charter Confirmed
            </span>
            <CheckCircle size={18} style={{ color: '#4ade80' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#4ade80', lineHeight: 1 }}>
            {stats?.confirmedEnquiries ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
            Contracted & executed charters
          </div>
        </div>
      </div>

      {/* Service Distribution & Pipeline Value */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px' }}>
          <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
            Portfolio Allocation
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '1.5rem' }}>
            Requests by Service Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={15} style={{ color: 'var(--color-gold)' }} /> Combined Air & Sea Expeditions
                </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{stats?.serviceDistribution?.both ?? 0}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, ((stats?.serviceDistribution?.both || 0) / (stats?.totalEnquiries || 1)) * 100)}%`, background: 'var(--color-gold)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plane size={15} style={{ color: 'var(--color-gold)' }} /> Private Aviation Only
                </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{stats?.serviceDistribution?.private_jet ?? 0}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, ((stats?.serviceDistribution?.private_jet || 0) / (stats?.totalEnquiries || 1)) * 100)}%`, background: '#38bdf8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Anchor size={15} style={{ color: 'var(--color-gold)' }} /> Superyacht Charters Only
                </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{stats?.serviceDistribution?.superyacht ?? 0}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, ((stats?.serviceDistribution?.superyacht || 0) / (stats?.totalEnquiries || 1)) * 100)}%`, background: '#34d399' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#0d1624', padding: '2rem', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
              Broker SLA Protocol
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              High-Net-Worth SLA Adherence
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              All client briefs must receive initial supplier availability confirmation or provisional itinerary options within 120 minutes of receipt.
            </p>
          </div>

          <div style={{ background: '#142236', padding: '1.25rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>Current Pipeline Health</div>
              <span className="badge-gold">Operational</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Average response time: 48 minutes across Monaco & London desks.
            </div>
          </div>
        </div>
      </div>

      {/* Recently Received Enquiries Table */}
      <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div className="gold-label">Recent Client Briefs</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff' }}>
              Recently Received Requests
            </h3>
          </div>
          <a href="/dashboard/enquiries" className="btn-outline-gold" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
            View All Enquiries
          </a>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Ref Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Client Principal</th>
                <th style={{ padding: '0.85rem 1rem' }}>Routing / Destination</th>
                <th style={{ padding: '0.85rem 1rem' }}>Budget</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned Broker</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentEnquiries && stats.recentEnquiries.length > 0 ? (
                stats.recentEnquiries.map((item) => (
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
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#cbd5e1' }}>{item.destination}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Dep: {item.departureLocation}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#f7f5f0' }}>
                      {item.budgetRange}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {item.assignedBrokerName || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <a
                        href={`/dashboard/enquiries/${item._id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: 'var(--color-gold)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                        }}
                      >
                        Manage <ChevronRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No recent inquiries recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

