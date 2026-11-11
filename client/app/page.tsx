'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import BrandIntroduction from '../components/home/BrandIntroduction';
import AviationShowcase from '../components/home/AviationShowcase';
import YachtShowcase from '../components/home/YachtShowcase';
import DestinationsShowcase from '../components/home/DestinationsShowcase';
import ExperiencesShowcase from '../components/home/ExperiencesShowcase';
import TrustPillars from '../components/home/TrustPillars';
import CtaBanner from '../components/home/CtaBanner';
import { fetchAircraft, fetchYachts, fetchDestinations } from '../lib/api';
import { IAircraft, IYacht, IDestination } from '../types';

export default function HomePage() {
  const [jets, setJets] = useState<IAircraft[]>([]);
  const [yachts, setYachts] = useState<IYacht[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);

  useEffect(() => {
    async function loadShowcaseData() {
      try {
        const [jetsData, yachtsData, destsData] = await Promise.allSettled([
          fetchAircraft({ limit: 3 }),
          fetchYachts({ limit: 3 }),
          fetchDestinations({ limit: 4 }),
        ]);

        if (jetsData.status === 'fulfilled') setJets(jetsData.value.slice(0, 3));
        if (yachtsData.status === 'fulfilled') setYachts(yachtsData.value.slice(0, 3));
        if (destsData.status === 'fulfilled') setDestinations(destsData.value.slice(0, 4));
      } catch (err) {
        console.error('Failed to load showcase data:', err);
      }
    }
    loadShowcaseData();
  }, []);

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0' }}>
      <HeroSection />
      <BrandIntroduction />
      <AviationShowcase jets={jets} />
      <YachtShowcase yachts={yachts} />
      <DestinationsShowcase destinations={destinations} />
      <ExperiencesShowcase />
      <TrustPillars />
      <CtaBanner />
    </div>
  );
}
