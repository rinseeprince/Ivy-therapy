'use client';

/**
 * ConsentModal Component
 * Blocking modal for first-run consent gate
 */

import { useState, useEffect } from 'react';
import {
  getConsentText,
  generateConsentTextHash,
  CURRENT_CONSENT_VERSION,
  detectLocale,
  getEmergencyContacts,
} from '@/lib/consent';
import type { ConsentAcceptRequest } from '@/types/database';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel?: () => void;
  locale?: string;
}

export default function ConsentModal({
  isOpen,
  onAccept,
  onCancel,
  locale: providedLocale,
}: ConsentModalProps) {
  const [locale, setLocale] = useState<string>(providedLocale || detectLocale());
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

  // Trap focus inside modal
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onCancel) {
          onCancel();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

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

      onAccept();
    } catch (err) {
      console.error('Consent submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit consent');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 id="consent-title" className="text-2xl font-bold mb-4">
            {consentText.title}
          </h2>

          <div className="space-y-4 mb-6">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {consentText.bullets.map((bullet, index) => (
                <li key={index} className="leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>

            {/* Emergency contacts */}
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <h3 className="font-semibold text-red-900 mb-2">Emergency Contacts</h3>
              <ul className="space-y-1 text-sm text-red-800">
                {emergencyContacts.map((contact, index) => (
                  <li key={index}>
                    <strong>{contact.name}:</strong> {contact.number} - {contact.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-6">
              {consentText.checkboxes.map((checkbox) => (
                <label
                  key={checkbox.id}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={checkboxes[checkbox.id as keyof typeof checkboxes]}
                    onChange={() => handleCheckboxChange(checkbox.id as keyof typeof checkboxes)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                  />
                  <span className="text-sm text-gray-800 flex-1">{checkbox.label}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {consentText.cancelButton}
                </button>
              )}
              <button
                type="submit"
                disabled={!allChecked || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : consentText.continueButton}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
