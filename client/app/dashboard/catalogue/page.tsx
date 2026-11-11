'use client';

import React, { useState, useEffect } from 'react';
import {
  Plane,
  Anchor,
  Compass,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import {
  fetchAircraft,
  fetchYachts,
  fetchDestinations,
  createAircraftApi,
  updateAircraftApi,
  deleteAircraftApi,
  createYachtApi,
  updateYachtApi,
  deleteYachtApi,
} from '../../../lib/api';
import { IAircraft, IYacht, IDestination } from '../../../types';
import AddJetModal from '../../../components/dashboard/AddJetModal';
import AddYachtModal from '../../../components/dashboard/AddYachtModal';

export default function CatalogueManagementPage() {
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'jets' | 'yachts' | 'destinations'>('jets');

  const [jets, setJets] = useState<IAircraft[]>([]);
  const [yachts, setYachts] = useState<IYacht[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  const [showAddJetModal, setShowAddJetModal] = useState<boolean>(false);
  const [showAddYachtModal, setShowAddYachtModal] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jetsData, yachtsData, destsData] = await Promise.all([
        fetchAircraft(),
        fetchYachts(),
        fetchDestinations(),
      ]);
      setJets(jetsData);
      setYachts(yachtsData);
      setDestinations(destsData);
    } catch (err) {
      console.error('Failed to load catalogue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublishJet = async (aircraft: IAircraft) => {
    if (!token || !isAdmin) return;
    try {
      await updateAircraftApi(token, aircraft._id, { isPublished: !aircraft.isPublished });
      setActionSuccess(`Aircraft "${aircraft.name}" ${aircraft.isPublished ? 'unpublished' : 'published'}`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    }
  };

  const handleDeleteJet = async (id: string, name: string) => {
    if (!token || !isAdmin) return;
    if (!confirm(`Are you sure you wish to remove ${name} from the fleet directory?`)) return;
    try {
      await deleteAircraftApi(token, id);
      setActionSuccess(`Aircraft "${name}" removed`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Deletion failed');
    }
  };

  const handleCreateJet = async (jetData: Partial<IAircraft>) => {
    if (!token || !isAdmin) return;
    await createAircraftApi(token, jetData);
    setActionSuccess(`Aircraft "${jetData.name}" added to fleet!`);
    loadData();
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleTogglePublishYacht = async (yacht: IYacht) => {
    if (!token || !isAdmin) return;
    try {
      await updateYachtApi(token, yacht._id, { isPublished: !yacht.isPublished });
      setActionSuccess(`Superyacht "${yacht.name}" ${yacht.isPublished ? 'unpublished' : 'published'}`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    }
  };

  const handleDeleteYacht = async (id: string, name: string) => {
    if (!token || !isAdmin) return;
    if (!confirm(`Are you sure you wish to remove ${name} from the superyacht collection?`)) return;
    try {
      await deleteYachtApi(token, id);
      setActionSuccess(`Superyacht "${name}" removed`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Deletion failed');
    }
  };

  const handleCreateYacht = async (yachtData: Partial<IYacht>) => {
    if (!token || !isAdmin) return;
    await createYachtApi(token, yachtData);
    setActionSuccess(`Superyacht "${yachtData.name}" added to collection!`);
    loadData();
    setTimeout(() => setActionSuccess(''), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="gold-label" style={{ marginBottom: '0.35rem' }}>
            Catalogue Administration
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
            Fleet & Destination Inventory
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Manage published aircraft, charter superyachts, and curated destination guides.
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAddJetModal(true)}
              className="btn-gold"
              style={{ fontSize: '0.75rem', padding: '0.65rem 1.25rem' }}
            >
              <Plus size={15} /> Add Private Jet
            </button>
            <button
              onClick={() => setShowAddYachtModal(true)}
              className="btn-outline-gold"
              style={{ fontSize: '0.75rem', padding: '0.65rem 1.25rem' }}
            >
              <Plus size={15} /> Add Superyacht
            </button>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#86efac', padding: '0.75rem 1.25rem', borderRadius: '2px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem 1.25rem', borderRadius: '2px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('jets')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'jets' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'jets' ? 'var(--color-gold)' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          <Plane size={16} /> Private Jets ({jets.length})
        </button>

        <button
          onClick={() => setActiveTab('yachts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'yachts' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'yachts' ? 'var(--color-gold)' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          <Anchor size={16} /> Superyachts ({yachts.length})
        </button>

        <button
          onClick={() => setActiveTab('destinations')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'destinations' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'destinations' ? 'var(--color-gold)' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          <Compass size={16} /> Destinations ({destinations.length})
        </button>
      </div>

      {/* TAB 1: PRIVATE JETS */}
      {activeTab === 'jets' && (
        <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Aircraft</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Range / Speed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Guests</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Hourly Rate</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Visibility</th>
                  {isAdmin && <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {jets.map((aircraft) => (
                  <tr key={aircraft._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '36px',
                            borderRadius: '2px',
                            backgroundImage: `url(${aircraft.featuredImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 600 }}>{aircraft.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{aircraft.model}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge-navy">{aircraft.category}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {aircraft.range} nm &bull; {aircraft.cruiseSpeed} kts
                    </td>
                    <td style={{ padding: '1rem', color: '#ffffff' }}>
                      Up to {aircraft.passengerCapacity}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      ${aircraft.hourlyRateEstimate?.toLocaleString() || 'N/A'}/hr
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {aircraft.isPublished ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <Eye size={14} /> Published
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <EyeOff size={14} /> Draft
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleTogglePublishJet(aircraft)}
                            title={aircraft.isPublished ? 'Unpublish' : 'Publish'}
                            style={{ background: '#142236', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.4rem', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            {aircraft.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteJet(aircraft._id, aircraft.name)}
                            title="Delete"
                            style={{ background: '#142236', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.4rem', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPERYACHTS */}
      {activeTab === 'yachts' && (
        <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Yacht</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Builder / Year</th>
                  <th style={{ padding: '0.85rem 1rem' }}>LOA</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Guests / Cabins</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Weekly Rate</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Visibility</th>
                  {isAdmin && <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {yachts.map((yacht) => (
                  <tr key={yacht._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '36px',
                            borderRadius: '2px',
                            backgroundImage: `url(${yacht.featuredImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 600 }}>{yacht.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{yacht.regions.join(' • ')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {yacht.builder} ({yacht.yearBuilt})
                    </td>
                    <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 500 }}>
                      {yacht.length}m / {yacht.lengthFeet}ft
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {yacht.guestCapacity} Guests / {yacht.cabins} Cabins
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      ${yacht.weeklyRateEstimate?.toLocaleString() || 'N/A'}/wk
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {yacht.isPublished ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <Eye size={14} /> Published
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <EyeOff size={14} /> Draft
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleTogglePublishYacht(yacht)}
                            title={yacht.isPublished ? 'Unpublish' : 'Publish'}
                            style={{ background: '#142236', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.4rem', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            {yacht.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteYacht(yacht._id, yacht.name)}
                            title="Delete"
                            style={{ background: '#142236', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.4rem', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div style={{ background: '#0d1624', border: '1px solid rgba(198, 167, 106, 0.2)', borderRadius: '2px', padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Region</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Best Season</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Executive Airports</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest) => (
                  <tr key={dest._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '36px',
                            borderRadius: '2px',
                            backgroundImage: `url(${dest.featuredImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 600 }}>{dest.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{dest.tagline}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{dest.region}</td>
                    <td style={{ padding: '1rem', color: '#ffffff' }}>{dest.bestTimeToVisit}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.75rem' }}>
                      {dest.nearestAirports.join(', ')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                        <Eye size={14} /> Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extracted Modals */}
      <AddJetModal
        isOpen={showAddJetModal}
        onClose={() => setShowAddJetModal(false)}
        onSubmit={handleCreateJet}
      />
      <AddYachtModal
        isOpen={showAddYachtModal}
        onClose={() => setShowAddYachtModal(false)}
        onSubmit={handleCreateYacht}
      />
    </div>
  );
}
