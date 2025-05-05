/* eslint-disable no-undef */
const {
  getAllKeys,
  hasHtmlTagDifference,
  hasPlaceholderDifference,
  isUntranslated,
  validate
} = require('../src/scripts/validate-translations');

describe('Utility functions', () => {
  describe('getAllKeys()', () => {
    test('flattens nested objects', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      const values = {};
      const keys = getAllKeys(obj, values);
      expect(keys).toContain('a.b.c');
      expect(keys).toContain('d');
      expect(values['a.b.c']).toBe(1);
      expect(values['d']).toBe(2);
    });

    test('handles arrays as values (not recursing into them)', () => {
      const obj = { arr: [1, 2, 3] };
      const values = {};
      const keys = getAllKeys(obj, values);
      expect(keys).toContain('arr');
      expect(values['arr']).toEqual([1, 2, 3]);
    });
  });

  describe('hasHtmlTagDifference()', () => {
    test('detects missing tags in target', () => {
      const en = '<b>Bold</b><i>Italics</i>';
      const fr = '<b>Bold</b>';
      expect(hasHtmlTagDifference(en, fr)).toBe(true);
    });

    test('detects extra tags in target', () => {
      const en = 'Text';
      const fr = '<span>Text</span>';
      expect(hasHtmlTagDifference(en, fr)).toBe(true);
    });

    test('returns false when tags match exactly', () => {
      const en = '<u>Underlined</u>';
      const fr = '<u>Underlined</u>';
      expect(hasHtmlTagDifference(en, fr)).toBe(false);
    });

    test('returns false when either string is empty or falsy', () => {
      expect(hasHtmlTagDifference('', '<b>x</b>')).toBe(false);
      expect(hasHtmlTagDifference(null, '<b>x</b>')).toBe(false);
    });
  });

  describe('hasPlaceholderDifference()', () => {
    test('detects missing placeholder in target', () => {
      const en = 'Hello {{name}}, you have {{count}} messages';
      const fr = 'Bonjour {{name}}';
      expect(hasPlaceholderDifference(en, fr)).toBe(true);
    });

    test('detects extra placeholder in target', () => {
      const en = 'Hi {{user}}';
      const fr = 'Salut {{user}} {{extras}}';
      expect(hasPlaceholderDifference(en, fr)).toBe(true);
    });

    test('returns false when placeholders match', () => {
      const en = 'Value: {{val}}';
      const fr = 'Valeur : {{val}}';
      expect(hasPlaceholderDifference(en, fr)).toBe(false);
    });

    test('returns false on falsy inputs', () => {
      expect(hasPlaceholderDifference(null, '{{x}}')).toBe(false);
      expect(hasPlaceholderDifference('foo', '')).toBe(false);
    });
  });

  describe('isUntranslated()', () => {
    test('flags identical non-whitelisted strings', () => {
      const en = 'This should be translated';
      const fr = 'This should be translated';
      expect(isUntranslated(en, fr)).toBe(true);
    });

    test('does not flag strings in identicalTranslations list', () => {
      const en = 'JSON'; // allowed to be identical
      const fr = 'JSON'; // allowed to be identical
      expect(isUntranslated(en, fr)).toBe(false);
    });

    test('does not flag strings in toDoTranslations list (but logs warning)', () => {
      const en = 'Dark'; // in toDoTranslations
      const fr = 'Dark'; // in toDoTranslations
      expect(isUntranslated(en, fr)).toBe(false);
    });

    test('does not flag when en !== fr', () => {
      const en = 'foo';
      const fr = 'bar';
      expect(isUntranslated(en, fr)).toBe(false);
    });
  });

  describe('validate()', () => {
    const baseEn = {
      key1: 'Text {{x}}',
      key2: '<b>Bold</b>',
      key3: 'Same',
      key4: 'Check placeholder {{a}}'
    };

    const baseFr = {
      key1: 'Texte {{x}}',         // ok
      key2: 'Text no tag',         // html mismatch
      key4: 'Placeholder mismatch {{b}}', // placeholder mismatch
      key5: 'Extra'                // obsolete
      // missing key3
    };

    test('detects missing, obsolete, htmlDiff, placeholderDiff, untranslated', () => {
      const result = validate(baseEn, baseFr);

      expect(result.isValid).toBe(false);

      // missing key3
      expect(result.missingKeys).toContain('key3');

      // obsolete key5
      expect(result.obsoleteKeys).toContain('key5');

      // html tag difference on key2
      expect(Object.keys(result.htmlTagDifferences)).toContain('key2');

      // placeholder mismatch on key4
      expect(Object.keys(result.placeholderDifferences)).toContain('key4');

      // untranslated keys: none, because key3 is missing, and others differ
      expect(Object.keys(result.untranslated)).toHaveLength(0);
    });

    test('valid bundle returns isValid=true and empty diffs', () => {
      const en = { a: 'One {{x}}', b: '<i>Two</i>' };
      const fr = { a: 'Un {{x}}', b: '<i>Deux</i>' };
      const res = validate(en, fr);

      expect(res.isValid).toBe(true);
      expect(res.missingKeys).toHaveLength(0);
      expect(res.obsoleteKeys).toHaveLength(0);
      expect(Object.keys(res.htmlTagDifferences)).toHaveLength(0);
      expect(Object.keys(res.placeholderDifferences)).toHaveLength(0);
      expect(Object.keys(res.untranslated)).toHaveLength(0);
    });
  });
});
