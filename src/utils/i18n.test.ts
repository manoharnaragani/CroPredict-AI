import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEDULED_LANGUAGES,
  t,
  getStoredLanguage,
  registerRegionalLanguage,
} from './i18n.ts';
import { getEffectiveTheme } from './theme.ts';

test('i18n includes English and all 22 Eighth Schedule Indian languages', () => {
  // English + 22 Scheduled Indian languages = 23 languages
  assert.equal(SCHEDULED_LANGUAGES.length >= 23, true);
  const codes = SCHEDULED_LANGUAGES.map(l => l.code);
  assert.ok(codes.includes('en'));
  assert.ok(codes.includes('hi'));
  assert.ok(codes.includes('bn'));
  assert.ok(codes.includes('te'));
  assert.ok(codes.includes('mr'));
  assert.ok(codes.includes('ta'));
  assert.ok(codes.includes('ur'));
  assert.ok(codes.includes('gu'));
  assert.ok(codes.includes('kn'));
  assert.ok(codes.includes('ml'));
  assert.ok(codes.includes('or'));
  assert.ok(codes.includes('pa'));
  assert.ok(codes.includes('as'));
  assert.ok(codes.includes('mai'));
  assert.ok(codes.includes('sat'));
  assert.ok(codes.includes('ks'));
  assert.ok(codes.includes('ne'));
  assert.ok(codes.includes('kok'));
  assert.ok(codes.includes('sd'));
  assert.ok(codes.includes('doi'));
  assert.ok(codes.includes('brx'));
  assert.ok(codes.includes('mni'));
  assert.ok(codes.includes('sa'));
});

test('Branding strictly returns exact spelling "CroPredict AI" in every language', () => {
  assert.equal(t('appName', 'en'), 'CroPredict AI');
  assert.equal(t('appName', 'hi'), 'CroPredict AI');
  assert.equal(t('appName', 'ta'), 'CroPredict AI');
  assert.equal(t('appName', 'bn'), 'CroPredict AI');
  assert.equal(t('appName', 'ur'), 'CroPredict AI');
});

import {
  getCropDisplayName,
  getLanguageCoverageReport,
  getSeasonDisplayName,
} from './i18n.ts';

test('i18n falls back gracefully to English when key is missing in regional dictionary', () => {
  // Test fallback by registering a minimal dialect that only translates navOverview
  registerRegionalLanguage(
    { code: 'test-dialect' as any, name: 'Test Dialect', nativeName: 'Test' },
    { navOverview: 'Custom Overview' }
  );
  assert.equal(t('navOverview', 'test-dialect' as any), 'Custom Overview');
  // For unprovided keys, gracefully falls back to English
  assert.equal(t('temperature', 'test-dialect' as any), 'Temperature');
  assert.equal(t('rainProbability', 'test-dialect' as any), 'Rain Probability');
});

test('Crop IDs remain stable as values while labels are translated into native script', () => {
  const stableId = 'Rice (Paddy)';
  const hiLabel = getCropDisplayName(stableId, 'hi');
  const knLabel = getCropDisplayName(stableId, 'kn');
  const teLabel = getCropDisplayName(stableId, 'te');
  const enLabel = getCropDisplayName(stableId, 'en');

  assert.equal(enLabel, 'Rice (Paddy)');
  assert.ok(hiLabel.includes('धान'));
  assert.ok(hiLabel.includes('Rice (Paddy)'));
  assert.ok(knLabel.includes('ಭತ್ತ'));
  assert.ok(teLabel.includes('వరి'));
});

test('Season values remain stable while labels are translated into native script', () => {
  assert.equal(getSeasonDisplayName('Kharif', 'en'), 'Kharif');
  assert.ok(getSeasonDisplayName('Kharif', 'hi').includes('खरीफ'));
  assert.ok(getSeasonDisplayName('Rabi', 'kn').includes('ರಬಿ'));
});

test('getLanguageCoverageReport reports coverage and missing keys across all 22 languages', () => {
  const report = getLanguageCoverageReport();
  assert.ok(report.en);
  assert.equal(report.en.coveragePct, 100);
  assert.ok(report.hi);
  assert.ok(report.hi.coveragePct >= 90);
  assert.ok(report.bn);
  assert.ok(report.te);
  assert.ok(report.ta);
  assert.ok(report.kn);
});

test('Can register additional regional dialects or languages', () => {
  registerRegionalLanguage(
    { code: 'bho' as any, name: 'Bhojpuri', nativeName: 'भोजपुरी' },
    { navOverview: 'सिंहावलोकन (भोजपुरी)' }
  );
  assert.equal(t('appName', 'bho' as any), 'CroPredict AI');
  assert.equal(t('navOverview', 'bho' as any), 'सिंहावलोकन (भोजपुरी)');
});

test('Theme resolution accurately handles explicit light, dark, and system fallback', () => {
  assert.equal(getEffectiveTheme('light'), 'light');
  assert.equal(getEffectiveTheme('dark'), 'dark');
  // System in node environment returns light as fallback
  assert.equal(getEffectiveTheme('system'), 'light');
});
