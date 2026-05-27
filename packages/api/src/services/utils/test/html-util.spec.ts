import {HtmlUtil} from '../html-util';

describe('HtmlUtil', () => {
  describe('sanitize', () => {
    test('should return empty string for empty input', () => {
      expect(HtmlUtil.sanitize('')).toBe('');
    });

    test('should pass plain text through unchanged', () => {
      expect(HtmlUtil.sanitize('Hello World')).toBe('Hello World');
    });

    test('should strip script tags and their content', () => {
      expect(HtmlUtil.sanitize('<script>alert(1)</script>')).toBe('');
    });

    test('should remove on* event handler attributes', () => {
      expect(HtmlUtil.sanitize('<b onclick="evil()">text</b>')).toBe('<b>text</b>');
    });

    test('should remove javascript: hrefs', () => {
      expect(HtmlUtil.sanitize('<a href="javascript:alert(1)">link</a>')).not.toContain('javascript:');
    });

    test('should not add target or rel to links without a target attribute', () => {
      const result = HtmlUtil.sanitize('<a href="https://example.com">link</a>');
      expect(result).not.toContain('target=');
      expect(result).not.toContain('rel=');
    });

    test('should add rel="noopener noreferrer" to target="_blank" links', () => {
      const result = HtmlUtil.sanitize('<a href="https://example.com" target="_blank">link</a>');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    test('should preserve target value other than _blank without adding rel', () => {
      const result = HtmlUtil.sanitize('<a href="https://example.com" target="_self">link</a>');
      expect(result).toContain('target="_self"');
      expect(result).not.toContain('rel=');
    });

    test('should accept a custom config', () => {
      const result = HtmlUtil.sanitize('<div><b>text</b></div>', {ALLOWED_TAGS: ['div', 'b']});
      expect(result).toBe('<div><b>text</b></div>');
    });
  });
});
