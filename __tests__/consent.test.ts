/**
 * Unit Tests for Consent System
 */

import { describe, it, expect } from 'vitest';
import {
  generateConsentTextHash,
  validateConsentData,
  getConsentText,
  detectLocale,
  CURRENT_CONSENT_VERSION,
} from '@/lib/consent';

describe('Consent System', () => {
  describe('generateConsentTextHash', () => {
    it('should generate consistent hash for same locale', () => {
      const hash1 = generateConsentTextHash('en-GB');
      const hash2 = generateConsentTextHash('en-GB');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different locales', () => {
      const hashGB = generateConsentTextHash('en-GB');
      const hashUS = generateConsentTextHash('en-US');
      expect(hashGB).not.toBe(hashUS);
    });

    it('should generate sha256 prefixed hash', () => {
      const hash = generateConsentTextHash('en-GB');
      expect(hash).toMatch(/^sha256-[a-f0-9]{64}$/);
    });

    it('should use default locale when none provided', () => {
      const hash1 = generateConsentTextHash();
      const hash2 = generateConsentTextHash('en-GB');
      expect(hash1).toBe(hash2);
    });
  });

  describe('validateConsentData', () => {
    it('should validate when all checkboxes are true', () => {
      const result = validateConsentData({
        acknowledgedAiLimitations: true,
        confirmedNotEmergency: true,
        confirmedAgeOver18: true,
        acceptedTermsPrivacy: true,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when AI limitations not acknowledged', () => {
      const result = validateConsentData({
        acknowledgedAiLimitations: false,
        confirmedNotEmergency: true,
        confirmedAgeOver18: true,
        acceptedTermsPrivacy: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You must acknowledge the AI limitations.');
    });

    it('should fail when age not confirmed', () => {
      const result = validateConsentData({
        acknowledgedAiLimitations: true,
        confirmedNotEmergency: true,
        confirmedAgeOver18: false,
        acceptedTermsPrivacy: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You must be 18 or older to use this app.');
    });

    it('should fail when terms not accepted', () => {
      const result = validateConsentData({
        acknowledgedAiLimitations: true,
        confirmedNotEmergency: true,
        confirmedAgeOver18: true,
        acceptedTermsPrivacy: false,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('You must accept the Terms of Service and Privacy Policy.');
    });

    it('should collect multiple errors', () => {
      const result = validateConsentData({
        acknowledgedAiLimitations: false,
        confirmedNotEmergency: false,
        confirmedAgeOver18: false,
        acceptedTermsPrivacy: false,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });

  describe('getConsentText', () => {
    it('should return en-GB text by default', () => {
      const text = getConsentText();
      expect(text.title).toBe('About this app');
      expect(text.bullets).toContain(
        'If you are in immediate danger, call 999. For urgent emotional support in the UK, contact Samaritans at 116 123 (free, 24/7).'
      );
    });

    it('should return en-US text when requested', () => {
      const text = getConsentText('en-US');
      expect(text.title).toBe('About this app');
      expect(text.bullets).toContain(
        'If you are in immediate danger, call 911. For urgent emotional support in the US, contact the 988 Suicide & Crisis Lifeline (free, 24/7).'
      );
    });

    it('should have correct checkbox structure', () => {
      const text = getConsentText('en-GB');
      expect(text.checkboxes).toHaveLength(4);
      expect(text.checkboxes[0]).toHaveProperty('id', 'acknowledgedAiLimitations');
      expect(text.checkboxes[0]).toHaveProperty('label');
    });

    it('should fallback to en-GB for unsupported locales', () => {
      const text = getConsentText('fr-FR');
      expect(text.title).toBe('About this app');
      // Should use GB emergency numbers as fallback
      expect(text.bullets).toContain(
        'If you are in immediate danger, call 999. For urgent emotional support in the UK, contact Samaritans at 116 123 (free, 24/7).'
      );
    });
  });

  describe('CURRENT_CONSENT_VERSION', () => {
    it('should be defined', () => {
      expect(CURRENT_CONSENT_VERSION).toBeDefined();
      expect(typeof CURRENT_CONSENT_VERSION).toBe('string');
    });

    it('should follow version format', () => {
      expect(CURRENT_CONSENT_VERSION).toMatch(/^v\d+\.\d+$/);
    });
  });
});
