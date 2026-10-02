/**
 * Collapses all whitespace in the text to single spaces and trims it.
 *
 * @param text The text to normalize. `null` and `undefined` are treated as an empty text.
 * @returns The normalized text.
 */
export const normalizeText = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim();

/**
 * Converts HTML, e.g. a translation that contains markup, to its normalized plain text.
 *
 * @param html The HTML to convert.
 * @returns The normalized text content of the HTML.
 */
export const htmlToPlainText = (html: string): string => {
  const element = document.createElement('div');
  element.innerHTML = html;
  return normalizeText(element.textContent);
};

/**
 * Returns the normalized text of an element, without the labels of the links it contains.
 *
 * @example
 * // <p>The license is invalid. <a href="/license">Set a new license</a></p>
 * getTextWithoutLinks(paragraph); // 'The license is invalid.'
 *
 * @param element The element to read the text of. It is not modified.
 * @returns The normalized text of the element, without its links.
 */
export const getTextWithoutLinks = (element: HTMLElement): string => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('a').forEach((link) => link.remove());
  return normalizeText(clone.textContent);
};
