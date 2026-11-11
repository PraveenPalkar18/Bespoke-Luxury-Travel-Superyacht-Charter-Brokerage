'use client';

import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext: string;
  icon: React.ReactNode;
  accentColor?: string;
  borderColor?: string;
}

export default function MetricCard({
  label,
  value,
  subtext,
  icon,
  accentColor = '#ffffff',
  borderColor = 'rgba(198, 167, 106, 0.25)',
}: MetricCardProps) {
  return (
    <div
      style={{
        background: '#0e1724',
        padding: '1.75rem',
        border: `1px solid ${borderColor}`,
        borderRadius: '2px',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.725rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.5rem',
          color: accentColor,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
        {subtext}
      </div>
    </div>
  );
}

