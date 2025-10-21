/**
 * Consent Management Utilities
 * Handles consent text, versioning, and hash generation
 */

import { createHash } from 'crypto';

export const CURRENT_CONSENT_VERSION = 'v1.0';

// Consent text by locale
export const CONSENT_TEXT = {
  'en-GB': {
    title: 'About this app',
    bullets: [
      'This is a self-help and educational support tool. It is not a clinician and may be wrong.',
      'This app cannot diagnose, treat, or respond to emergencies.',
      'If you are in immediate danger, call 999. For urgent emotional support in the UK, contact Samaritans at 116 123 (free, 24/7).',
      'You must be 18 or older to use this app.',
      'By continuing, you agree to our Terms of Service and Privacy Policy.',
    ],
    checkboxes: [
      {
        id: 'acknowledgedAiLimitations',
        label: 'I understand the AI is not a clinician and may make mistakes.',
      },
      {
        id: 'confirmedNotEmergency',
        label: 'I am not in immediate danger and will use emergency services for emergencies.',
      },
      {
        id: 'confirmedAgeOver18',
        label: 'I am 18 or older.',
      },
      {
        id: 'acceptedTermsPrivacy',
        label: 'I accept the Terms of Service and Privacy Policy.',
      },
    ],
    continueButton: 'Continue',
    cancelButton: 'Cancel',
  },
  'en-US': {
    title: 'About this app',
    bullets: [
      'This is a self-help and educational support tool. It is not a clinician and may be wrong.',
      'This app cannot diagnose, treat, or respond to emergencies.',
      'If you are in immediate danger, call 911. For urgent emotional support in the US, contact the 988 Suicide & Crisis Lifeline (free, 24/7).',
      'You must be 18 or older to use this app.',
      'By continuing, you agree to our Terms of Service and Privacy Policy.',
    ],
    checkboxes: [
      {
        id: 'acknowledgedAiLimitations',
        label: 'I understand the AI is not a clinician and may make mistakes.',
      },
      {
        id: 'confirmedNotEmergency',
        label: 'I am not in immediate danger and will use emergency services for emergencies.',
      },
      {
        id: 'confirmedAgeOver18',
        label: 'I am 18 or older.',
      },
      {
        id: 'acceptedTermsPrivacy',
        label: 'I accept the Terms of Service and Privacy Policy.',
      },
    ],
    continueButton: 'Continue',
    cancelButton: 'Cancel',
  },
} as const;

export type SupportedLocale = keyof typeof CONSENT_TEXT;

/**
 * Get consent text for a specific locale, fallback to en-GB
 */
export function getConsentText(locale: string = 'en-GB') {
  const normalizedLocale = locale as SupportedLocale;
  return CONSENT_TEXT[normalizedLocale] || CONSENT_TEXT['en-GB'];
}

/**
 * Generate a deterministic hash of consent text
 * Used to track which version of consent text the user saw
 */
export function generateConsentTextHash(locale: string = 'en-GB'): string {
  const text = getConsentText(locale);

  // Create a canonical string representation
  const canonical = JSON.stringify({
    title: text.title,
    bullets: text.bullets,
    checkboxes: text.checkboxes.map(c => c.label),
  });

  // Generate SHA-256 hash
  const hash = createHash('sha256').update(canonical).digest('hex');
  return `sha256-${hash}`;
}

/**
 * Detect user locale from browser or headers
 */
export function detectLocale(headers?: Headers): SupportedLocale {
  if (!headers) {
    // Client-side detection
    if (typeof navigator !== 'undefined') {
      const browserLocale = navigator.language || 'en-GB';
      if (browserLocale.startsWith('en-US')) return 'en-US';
    }
    return 'en-GB';
  }

  // Server-side detection from Accept-Language header
  const acceptLanguage = headers.get('accept-language') || '';
  if (acceptLanguage.includes('en-US')) return 'en-US';

  return 'en-GB';
}

/**
 * Validate consent form data
 */
export function validateConsentData(data: {
  acknowledgedAiLimitations: boolean;
  confirmedNotEmergency: boolean;
  confirmedAgeOver18: boolean;
  acceptedTermsPrivacy: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.acknowledgedAiLimitations) {
    errors.push('You must acknowledge the AI limitations.');
  }

  if (!data.confirmedNotEmergency) {
    errors.push('You must confirm you are not in immediate danger.');
  }

  if (!data.confirmedAgeOver18) {
    errors.push('You must be 18 or older to use this app.');
  }

  if (!data.acceptedTermsPrivacy) {
    errors.push('You must accept the Terms of Service and Privacy Policy.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Emergency contact information by locale
 */
export const EMERGENCY_CONTACTS = {
  'en-GB': [
    { name: 'Emergency Services', number: '999', description: 'For immediate danger' },
    { name: 'Samaritans', number: '116 123', description: 'Free 24/7 emotional support' },
    { name: 'NHS 111', number: '111', description: 'Non-emergency medical help' },
  ],
  'en-US': [
    { name: 'Emergency Services', number: '911', description: 'For immediate danger' },
    { name: '988 Suicide & Crisis Lifeline', number: '988', description: 'Free 24/7 crisis support' },
    { name: 'Crisis Text Line', number: '741741', description: 'Text HOME for support' },
  ],
} as const;

export function getEmergencyContacts(locale: string = 'en-GB') {
  const normalizedLocale = locale as SupportedLocale;
  return EMERGENCY_CONTACTS[normalizedLocale] || EMERGENCY_CONTACTS['en-GB'];
}
