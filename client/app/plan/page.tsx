'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { submitInquiry } from '../../lib/api';
import StepJourneyDetails from '../../components/plan/StepJourneyDetails';
import StepServices from '../../components/plan/StepServices';
import StepPreferences from '../../components/plan/StepPreferences';
import StepContact from '../../components/plan/StepContact';
import SubmissionConfirmation from '../../components/plan/SubmissionConfirmation';
import { RequestedService } from '../../types';

export default function PlanJourneyPage() {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    departureLocation: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    isFlexibleDates: false,
    travellers: 2,
    requestedServices: ['private_jet'] as RequestedService[],
    budgetRange: '$100k - $250k',
    travelPreferences: [] as string[],
    specialRequests: '',
    customerName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'email' as 'phone' | 'email' | 'whatsapp',
    additionalMessage: '',
    interestedAircraftId: '',
    interestedYachtId: '',
  });

  useEffect(() => {
    const aircraftParam = searchParams?.get('aircraft');
    const yachtParam = searchParams?.get('yacht');
    const destParam = searchParams?.get('destination');
    const expParam = searchParams?.get('experience');

    if (aircraftParam) {
      setFormData((prev) => ({
        ...prev,
        interestedAircraftId: aircraftParam,
        requestedServices: Array.from(new Set([...prev.requestedServices, 'private_jet'])) as RequestedService[],
      }));
    }
    if (yachtParam) {
      setFormData((prev) => ({
        ...prev,
        interestedYachtId: yachtParam,
        requestedServices: Array.from(new Set([...prev.requestedServices, 'superyacht'])) as RequestedService[],
      }));
    }
    if (destParam) {
      setFormData((prev) => ({
        ...prev,
        destination: decodeURIComponent(destParam),
      }));
    }
    if (expParam) {
      setFormData((prev) => ({
        ...prev,
        specialRequests: `Interested in: ${decodeURIComponent(expParam)}`,
        requestedServices: Array.from(new Set([...prev.requestedServices, 'bespoke_experiences'])) as RequestedService[],
      }));
    }
  }, [searchParams]);

  const validateStep = (step: number): boolean => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.departureLocation.trim()) {
        setErrorMessage('Please specify your departure city or executive airport.');
        return false;
      }
      if (!formData.destination.trim()) {
        setErrorMessage('Please specify your desired destination or cruising grounds.');
        return false;
      }
      if (!formData.departureDate) {
        setErrorMessage('Please select a preliminary departure date.');
        return false;
      }
      if (formData.travellers < 1) {
        setErrorMessage('Please indicate at least 1 traveller in your party.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (formData.requestedServices.length === 0) {
        setErrorMessage('Please select at least one charter service.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.budgetRange) {
        setErrorMessage('Please select an estimated charter budget tier.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.customerName.trim()) {
        setErrorMessage('Please provide your full legal or charter principal name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please provide a valid private email address.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage('Please provide a direct telephone or WhatsApp contact number.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const toggleService = (service: RequestedService) => {
    setFormData((prev) => {
      const exists = prev.requestedServices.includes(service);
      const updated = exists
        ? prev.requestedServices.filter((s) => s !== service)
        : [...prev.requestedServices, service];
      return { ...prev, requestedServices: updated };
    });
  };

  const togglePreference = (pref: string) => {
    setFormData((prev) => {
      const exists = prev.travelPreferences.includes(pref);
      return {
        ...prev,
        travelPreferences: exists
          ? prev.travelPreferences.filter((p) => p !== pref)
          : [...prev.travelPreferences, pref],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await submitInquiry({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod,
        departureLocation: formData.departureLocation,
        destination: formData.destination,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate || undefined,
        isFlexibleDates: formData.isFlexibleDates,
        travellers: Number(formData.travellers),
        requestedServices: formData.requestedServices,
        budgetRange: formData.budgetRange,
        travelPreferences: formData.travelPreferences,
        specialRequests:
          formData.specialRequests +
          (formData.additionalMessage ? ` | Notes: ${formData.additionalMessage}` : ''),
        interestedAircraftId: formData.interestedAircraftId || undefined,
        interestedYachtId: formData.interestedYachtId || undefined,
      });

      setReferenceCode(res.referenceCode || 'AUR-2026-CONF');
      setSubmissionSuccess(true);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission failure:', err);
      setErrorMessage(
        err.message || 'We encountered an error processing your enquiry. Please verify details and retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#09101a', color: '#f7f5f0', minHeight: '100vh', paddingTop: '6.5rem' }}>
      {/* Header Banner */}
      <section
        style={{
          padding: '3.5rem 1.5rem 2.5rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(9, 16, 26, 0.8), rgba(9, 16, 26, 0.95)), url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(198, 167, 106, 0.2)',
          textAlign: 'center',
        }}
      >
        <div className="container-narrow">
          <div className="gold-label" style={{ marginBottom: '0.5rem' }}>
            Bespoke Advisory
          </div>
          <h1 className="heading-editorial" style={{ color: '#ffffff', marginBottom: '0.75rem' }}>
            Commission Your Custom Journey
          </h1>
          <div className="gold-divider center" />
          <p className="lead-text" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Every itinerary is personally orchestrated by a Senior Charter Director. Complete our 4-step consultation brief to receive tailored aircraft & yacht options within 2 hours.
          </p>
        </div>
      </section>

      {/* Main Wizard Area */}
      <section className="section-spacing" style={{ paddingTop: '3.5rem' }}>
        <div className="container-narrow">
          {submissionSuccess ? (
            <SubmissionConfirmation
              referenceCode={referenceCode}
              customerName={formData.customerName}
              destination={formData.destination}
            />
          ) : (
            <div
              style={{
                background: '#101c2c',
                border: '1px solid rgba(198, 167, 106, 0.25)',
                borderRadius: '2px',
                padding: '3rem 2.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              {/* Progress Indicator */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
                    Step {currentStep} of 4 &mdash;{' '}
                    {currentStep === 1 && 'Journey Itinerary'}
                    {currentStep === 2 && 'Required Charter Services'}
                    {currentStep === 3 && 'Preferences & Budget'}
                    {currentStep === 4 && 'Principal Details & Discretion'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {Math.round((currentStep / 4) * 100)}% Complete
                  </div>
                </div>

                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${(currentStep / 4) * 100}%`,
                      background: 'var(--color-gold)',
                      transition: 'width 0.35s ease',
                    }}
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '0.9rem 1.25rem',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {currentStep === 1 && (
                <StepJourneyDetails formData={formData} setFormData={setFormData} />
              )}

              {currentStep === 2 && (
                <StepServices
                  requestedServices={formData.requestedServices}
                  toggleService={toggleService}
                />
              )}

              {currentStep === 3 && (
                <StepPreferences
                  budgetRange={formData.budgetRange}
                  setBudgetRange={(val) => setFormData({ ...formData, budgetRange: val })}
                  travelPreferences={formData.travelPreferences}
                  togglePreference={togglePreference}
                  specialRequests={formData.specialRequests}
                  setSpecialRequests={(val) => setFormData({ ...formData, specialRequests: val })}
                />
              )}

              {currentStep === 4 && (
                <StepContact formData={formData} setFormData={setFormData} />
              )}

              {/* Navigation Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '3rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '2rem',
                }}
              >
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline-gold"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-gold"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Continue to Step {currentStep + 1} <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-gold"
                    style={{
                      fontSize: '0.85rem',
                      padding: '1.1rem 2.5rem',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Transmitting to Charter Desk...' : 'Submit Bespoke Travel Enquiry'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
