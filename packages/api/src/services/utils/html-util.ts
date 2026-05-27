import DOMPurify from 'dompurify';

// Scoped instance — hooks are isolated to this instance and won't affect other DOMPurify consumers.
// If we need to sanitize, without the hooks, we can use DOMPurify.sanitize directly.
const purify = DOMPurify(globalThis);

// Default sanitization config — individual call sites can supply their own ALLOWED_TAGS / ALLOWED_ATTR etc.
// target and rel are always allowed, so the afterSanitizeAttributes hook can enforce _blank / noopener.
const DEFAULT_CONFIG: DOMPurify.Config = {
  ADD_ATTR: ['target', 'rel'],
};

purify.addHook('afterSanitizeAttributes', (node) => {
  if (node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  } else if (!node.hasAttribute('target') && (node.hasAttribute('xlink:href') || node.hasAttribute('href'))) {
    node.setAttribute('xlink:show', 'new');
  }
});

export class HtmlUtil {
  static sanitize(html: string, config: DOMPurify.Config = {}): string {
    const mergedConfig: DOMPurify.Config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    return purify.sanitize(html, mergedConfig);
  }
}
