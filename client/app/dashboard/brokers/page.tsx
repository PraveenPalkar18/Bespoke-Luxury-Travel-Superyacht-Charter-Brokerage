'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import {
  fetchBrokers,
  inviteBrokerApi,
  fetchPendingInvitations,
  revokeInvitationApi,
  updateBrokerStatusApi,
} from '../../../lib/api';
import { IUser } from '../../../types';

export default function BrokerManagementPage() {
  const { token, user } = useAuth();

  const [brokers, setBrokers] = useState<IUser[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteTitle, setInviteTitle] = useState('Charter Broker');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Status Action Confirmation State
  const [actionBroker, setActionBroker] = useState<IUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [brokersList, pendingInvites] = await Promise.all([
        fetchBrokers(token),
        fetchPendingInvitations(token).catch(() => []),
      ]);
      setBrokers(brokersList);
      setInvitations(pendingInvites);
    } catch (err) {
      console.error('Failed to load broker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setInviteLoading(true);
    setInviteError(null);

    try {
      const res = await inviteBrokerApi(token, {
        name: inviteName,
        email: inviteEmail,
        phone: invitePhone || undefined,
        title: inviteTitle || 'Charter Broker',
      });
      setGeneratedInviteUrl(res.inviteUrl);
      loadData();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to generate broker invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleStatus = async (broker: IUser) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const targetStatus = !broker.isActive;
      await updateBrokerStatusApi(token, broker.id || (broker as any)._id, targetStatus);
      setActionBroker(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update broker status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await revokeInvitationApi(token, inviteId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredBrokers = brokers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return b.isActive === true;
    if (statusFilter === 'inactive') return b.isActive === false;
    return true;
  });

  const totalActive = brokers.filter((b) => b.isActive).length;
  const totalInactive = brokers.filter((b) => !b.isActive).length;

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="gold-label" style={{ marginBottom: '0.35rem' }}>
            Managing Director Administration
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
            Brokerage Team & Access Control
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Manage broker permissions, credential onboarding, and active desk authorizations.
          </div>
        </div>

        <button
          onClick={() => {
            setShowInviteModal(true);
            setGeneratedInviteUrl(null);
            setInviteName('');
            setInviteEmail('');
            setInvitePhone('');
            setInviteError(null);
          }}
          className="btn-gold"
          style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} /> Invite Charter Broker
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#0e1724', padding: '1.5rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Roster <Users size={16} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', marginTop: '0.5rem' }}>
            {brokers.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>Authorized personnel</div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Desks <CheckCircle size={16} style={{ color: '#4ade80' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#4ade80', marginTop: '0.5rem' }}>
            {totalActive}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>Able to access terminal</div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fca5a5', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Deactivated <XCircle size={16} style={{ color: '#f87171' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#f87171', marginTop: '0.5rem' }}>
            {totalInactive}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>Access revoked in real-time</div>
        </div>

        <div style={{ background: '#0e1724', padding: '1.5rem', border: '1px solid rgba(198, 167, 106, 0.25)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fde047', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Invites <Clock size={16} style={{ color: '#facc15' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#fde047', marginTop: '0.5rem' }}>
            {invitations.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>Awaiting broker activation</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search brokers by name, title, or work email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="luxury-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                cursor: 'pointer',
                background: statusFilter === filter ? 'rgba(198, 167, 106, 0.2)' : '#0e1724',
                color: statusFilter === filter ? 'var(--color-gold)' : '#94a3b8',
                border: statusFilter === filter ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Brokers Table */}
      <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Broker Principal</th>
                <th style={{ padding: '0.85rem 1rem' }}>Role & Title</th>
                <th style={{ padding: '0.85rem 1rem' }}>Contact Channels</th>
                <th style={{ padding: '0.85rem 1rem' }}>Active Enquiries</th>
                <th style={{ padding: '0.85rem 1rem' }}>Account Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Last Session</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrokers.length > 0 ? (
                filteredBrokers.map((b) => (
                  <tr key={b.id || (b as any)._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{b.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{b.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={b.role === 'admin' ? 'badge-gold' : 'badge-navy'}>
                        {b.role === 'admin' ? 'Managing Director' : 'Charter Broker'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        {b.title || 'Desk Operator'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={12} style={{ color: 'var(--color-gold)' }} /> {b.email}
                      </div>
                      {b.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: '#94a3b8' }}>
                          <Phone size={12} /> {b.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: '#f7f5f0', fontWeight: 600 }}>
                      {b.assignedEnquiriesCount ?? 0} dossiers
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {b.isActive ? (
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '2px', textTransform: 'uppercase' }}>
                          Active
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '2px', textTransform: 'uppercase' }}>
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                      {b.lastLogin ? new Date(b.lastLogin).toLocaleString() : 'Never logged in'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {b.role === 'admin' ? (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Protected Account</span>
                      ) : (
                        <button
                          onClick={() => setActionBroker(b)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            background: b.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            border: b.isActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                            color: b.isActive ? '#f87171' : '#4ade80',
                          }}
                        >
                          {b.isActive ? 'Deactivate Access' : 'Reactivate Access'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No brokers found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem' }}>
        <div className="gold-label" style={{ marginBottom: '0.35rem' }}>Onboarding Pipeline</div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '1rem' }}>
          Pending Broker Invitations
        </h3>

        {invitations.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invited Candidate</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Designated Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Invitation Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expiration</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Revoke Link</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{inv.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{inv.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-gold)' }}>
                      {inv.title || 'Charter Broker'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '2px' }}>
                        Pending Single-Use Token
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRevokeInvite(inv._id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>
            No pending broker invitations. All issued invitations have been claimed or expired.
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.4)', borderRadius: '2px', padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
            {!generatedInviteUrl ? (
              <>
                <div className="gold-label" style={{ marginBottom: '0.25rem' }}>Administrative Onboarding</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
                  Issue Broker Invitation
                </h2>

                {inviteError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', padding: '0.75rem', borderRadius: '2px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    {inviteError}
                  </div>
                )}

                <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maximilien de Saint-Germain"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. m.saintgermain@aureliatravel.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="luxury-input"
                    />
                  </div>

                  <div className="grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Desk Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Superyacht Charter Broker"
                        value={inviteTitle}
                        onChange={(e) => setInviteTitle(e.target.value)}
                        className="luxury-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+377 98 06 20 00"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="btn-outline-gold"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="btn-gold"
                      style={{ fontSize: '0.8rem', opacity: inviteLoading ? 0.7 : 1 }}
                    >
                      {inviteLoading ? 'Generating Security Token...' : 'Generate Single-Use Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={28} />
                </div>
                <div className="gold-label" style={{ marginBottom: '0.25rem' }}>Invitation Ready</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.6rem', marginBottom: '1rem' }}>
                  Single-Use Access Token Issued
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  A cryptographic single-use invitation token has been stored in MongoDB. Deliver this link directly to the candidate to configure their confidential password:
                </p>

                <div style={{ background: '#09101a', border: '1px solid rgba(198, 167, 106, 0.3)', padding: '0.85rem', borderRadius: '2px', wordBreak: 'break-all', fontSize: '0.78rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                  {generatedInviteUrl}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => copyToClipboard(generatedInviteUrl)}
                    className="btn-gold"
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Invitation Link'}
                  </button>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="btn-outline-gold"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deactivation */}
      {actionBroker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ maxWidth: '440px', width: '100%', background: '#0d1624', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '2px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <div className="gold-label" style={{ marginBottom: '0.25rem' }}>Access Revocation Protocol</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              {actionBroker.isActive ? 'Deactivate Broker Access?' : 'Reactivate Broker Access?'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {actionBroker.isActive
                ? `Revoking access for ${actionBroker.name} will immediately invalidate all active sessions in MongoDB and terminate API access. Existing enquiry records remain preserved for handover.`
                : `Reactivating ${actionBroker.name} will restore login authorization to their assigned charter pipeline.`}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setActionBroker(null)}
                className="btn-outline-gold"
                style={{ fontSize: '0.8rem' }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus(actionBroker)}
                className={actionBroker.isActive ? 'btn-red' : 'btn-gold'}
                style={{
                  fontSize: '0.8rem',
                  background: actionBroker.isActive ? '#dc2626' : 'var(--color-gold)',
                  color: actionBroker.isActive ? '#ffffff' : '#070d15',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : actionBroker.isActive ? 'Confirm Deactivation' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
