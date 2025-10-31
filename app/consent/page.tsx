'use client';

/**
 * Consent Page
 * Full-page consent gate (alternative to modal)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getConsentText,
  generateConsentTextHash,
  CURRENT_CONSENT_VERSION,
  detectLocale,
  getEmergencyContacts,
} from '@/lib/consent';
import type { ConsentAcceptRequest } from '@/types/database';

export default function ConsentPage() {
  const router = useRouter();
  const [locale] = useState<string>(detectLocale());
  const [checkboxes, setCheckboxes] = useState({
    acknowledgedAiLimitations: false,
    confirmedNotEmergency: false,
    confirmedAgeOver18: false,
    acceptedTermsPrivacy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consentText = getConsentText(locale);
  const emergencyContacts = getEmergencyContacts(locale);

  const handleCheckboxChange = (id: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({ ...prev, [id]: !prev[id] }));
    setError(null);
  };

  const allChecked = Object.values(checkboxes).every(v => v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allChecked) {
      setError('Please check all boxes to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      const consentData: ConsentAcceptRequest = {
        consentVersion: CURRENT_CONSENT_VERSION,
        consentTextHash: generateConsentTextHash(locale),
        acknowledgedAiLimitations: checkboxes.acknowledgedAiLimitations,
        confirmedNotEmergency: checkboxes.confirmedNotEmergency,
        confirmedAgeOver18: checkboxes.confirmedAgeOver18,
        acceptedTermsPrivacy: checkboxes.acceptedTermsPrivacy,
        locale,
      };

      const response = await fetch('/api/consent/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to accept consent');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Consent submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit consent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6">{consentText.title}</h1>

        <div className="space-y-4 mb-6">
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            {consentText.bullets.map((bullet, index) => (
              <li key={index} className="leading-relaxed">
                {bullet}
              </li>
            ))}
          </ul>

          {/* Emergency contacts */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-6">
            <h2 className="font-semibold text-red-900 mb-3">Emergency Contacts</h2>
            <ul className="space-y-2 text-sm text-red-800">
              {emergencyContacts.map((contact, index) => (
                <li key={index}>
                  <strong>{contact.name}:</strong> {contact.number} - {contact.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6 border-t border-gray-200 pt-6">
            <p className="font-semibold text-gray-900 mb-3">Please confirm:</p>
            {consentText.checkboxes.map((checkbox) => (
              <label
                key={checkbox.id}
                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded"
              >
                <input
                  type="checkbox"
                  checked={checkboxes[checkbox.id as keyof typeof checkboxes]}
                  onChange={() => handleCheckboxChange(checkbox.id as keyof typeof checkboxes)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                />
                <span className="text-gray-800 flex-1">{checkbox.label}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              {consentText.cancelButton}
            </button>
            <button
              type="submit"
              disabled={!allChecked || isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Submitting...' : consentText.continueButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
