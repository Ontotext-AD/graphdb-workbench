import {escapeHtml} from './html-utils';
import {newSpecPage} from 'jest-stencil-runner';

describe('escapeHtml', () => {
  it('returns an empty string for missing input', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
    expect(escapeHtml(null as unknown as string)).toBe('');
  });

  it('passes plain text through unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('escapes the characters that have a special meaning in HTML', () => {
    expect(escapeHtml('<a href="x" title=\'y\'>Tom & Jerry</a>'))
      .toBe('&lt;a href=&quot;x&quot; title=&#039;y&#039;&gt;Tom &amp; Jerry&lt;/a&gt;');
  });

  it('escapes an ampersand only once', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('keeps JSON text readable from an HTML attribute', async () => {
    const json = JSON.stringify({id: 'repo "one"', title: '<b>it\'s</b>'});
    const page = await newSpecPage({
      components: [],
      html: `<span data-value="${escapeHtml(json)}"></span>`,
    });
    expect(page.body.querySelector('span')?.getAttribute('data-value')).toBe(json);
  });
});
