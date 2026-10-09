export function sanitizeHTML(html) {
  const element = document.createElement('textarea');
  element.innerHTML = html;
  return element.value;
}

/**
 * Escapes the characters that have a special meaning in HTML, so that the text can be written into an HTML string,
 * as content or as an attribute value.
 *
 * @param text The text to escape.
 * @returns The escaped text, or an empty string if no text is provided.
 */
export function escapeHtml(text: string): string {
  if (!text) {
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
