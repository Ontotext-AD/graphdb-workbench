// Page-side: one line describing the focused element (through shadow roots and same-origin iframes).
() => {
  let el = document.activeElement;
  let path = '';
  for (;;) {
    if (el?.shadowRoot?.activeElement) { path += `${el.tagName.toLowerCase()} >>> `; el = el.shadowRoot.activeElement; continue; }
    if (el?.tagName === 'IFRAME') {
      try { const inner = el.contentDocument?.activeElement; if (inner) { path += 'iframe >>> '; el = inner; continue; } } catch (e) { /* cross-origin */ }
    }
    break;
  }
  if (!el || el === document.body || el === document.documentElement) return 'nothing focused (body)';
  const clean = s => (s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const labelled = el.getAttribute('aria-labelledby');
  const name = clean(el.getAttribute('aria-label')
    || (labelled && labelled.split(/\s+/).map(id => el.ownerDocument.getElementById(id)?.textContent).join(' '))
    || el.innerText || el.getAttribute('title') || el.getAttribute('placeholder') || el.value);
  const tag = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '')
    + [...el.classList].slice(0, 3).map(c => `.${c}`).join('');
  const testId = el.getAttribute('data-test') || el.getAttribute('data-testid');
  const role = el.getAttribute('role');
  const cs = getComputedStyle(el);
  const ring = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px'
    ? `outline ${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`
    : (cs.boxShadow !== 'none' ? `box-shadow ${cs.boxShadow}` : 'no outline/box-shadow');
  return `${path}<${tag}>` + (testId ? ` data-test=${testId}` : '') + (role ? ` role=${role}` : '')
    + ` name="${name}" focus-visible=${el.matches(':focus-visible')} ring: ${ring}`;
}
