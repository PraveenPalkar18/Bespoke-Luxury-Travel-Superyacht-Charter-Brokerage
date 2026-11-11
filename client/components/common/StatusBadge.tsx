'use client';

import React from 'react';
import { InquiryStatus } from '../../types';

interface StatusBadgeProps {
  status: InquiryStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'new':
      return (
        <span
          style={{
            background: 'rgba(239, 68, 68, 0.18)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          New Request
        </span>
      );
    case 'in_review':
      return (
        <span
          style={{
            background: 'rgba(234, 179, 8, 0.18)',
            color: '#facc15',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Under Review
        </span>
      );
    case 'supplier_contacted':
      return (
        <span
          style={{
            background: 'rgba(59, 130, 246, 0.18)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Supplier Sourcing
        </span>
      );
    case 'quote_sent':
      return (
        <span
          style={{
            background: 'rgba(168, 85, 247, 0.18)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Dossier Sent
        </span>
      );
    case 'negotiating':
      return (
        <span
          style={{
            background: 'rgba(249, 115, 22, 0.18)',
            color: '#fb923c',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Negotiating
        </span>
      );
    case 'confirmed':
      return (
        <span
          style={{
            background: 'rgba(34, 197, 94, 0.18)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Charter Confirmed
        </span>
      );
    case 'archived':
      return (
        <span
          style={{
            background: 'rgba(148, 163, 184, 0.18)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        >
          Archived
        </span>
      );
    default:
      return (
        <span className="badge-navy" style={{ fontSize: '0.7rem' }}>
          {status}
        </span>
      );
  }
}

