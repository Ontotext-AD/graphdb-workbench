export function sanitizeHTML(html) {
  const element = document.createElement('textarea');
  element.innerHTML = html;
  return element.value;
}
