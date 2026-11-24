// run-code: computed value of one CSS property on the first element matching a selector, plus every matched
// rule (and inline style / inherited rule) that declares it, in cascade order, via CDP CSS.getMatchedStylesForNode.
// a.states forces pseudo-classes (hover, focus, focus-visible, active) on the element first.
async (page, a) => {
  const el = page.locator(a.selector).first();
  await el.waitFor({state: 'attached', timeout: 5000});
  await el.evaluate(n => n.setAttribute('data-pw-css', '1'));
  const cdp = await page.context().newCDPSession(page);
  const sheets = {};
  let inlineSheets = 0;
  cdp.on('CSS.styleSheetAdded', e => {
    sheets[e.header.styleSheetId] = e.header.sourceURL || (e.header.origin === 'regular' ? `<style #${++inlineSheets}>` : e.header.origin);
  });
  try {
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const {root} = await cdp.send('DOM.getDocument', {depth: -1, pierce: true});
    const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: root.nodeId, selector: '[data-pw-css="1"]'});
    if (!nodeId) {
      const computed = await el.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), a.prop);
      return `computed ${a.prop}: ${computed}\n(no CDP node: element inside a shadow root; computed value only)`;
    }
    if (a.states.length) await cdp.send('CSS.forcePseudoState', {nodeId, forcedPseudoClasses: a.states});
    const m = await cdp.send('CSS.getMatchedStylesForNode', {nodeId});
    const computed = await el.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), a.prop);
    // The property itself, its shorthand (background for background-color) and, on the element, its longhands.
    const declares = (name, own) => name === a.prop || a.prop.startsWith(name + '-') || (own && name.startsWith(a.prop + '-'));
    const src = r => {
      const url = (sheets[r.styleSheetId] || r.origin).replace(/^https?:\/\/[^/]+/, '');
      const line = r.style?.range ? `:${r.style.range.startLine + 1}` : '';
      return `${url}${line}`;
    };
    const out = [];
    const collect = (rules, label) => {
      for (const {rule} of rules || []) {
        for (const p of rule.style.cssProperties) {
          if (!declares(p.name, !label) || p.disabled || p.parsedOk === false || !p.value) continue;
          out.push(`${label}${rule.selectorList.text} { ${p.name}: ${p.value}${p.important ? ' !important' : ''} }  ${src(rule)}`);
        }
      }
    };
    collect(m.matchedCSSRules, '');
    for (const p of m.inlineStyle?.cssProperties || []) {
      if (declares(p.name, true) && p.value !== undefined && !p.disabled) out.push(`style="${p.name}: ${p.value}"  (inline)`);
    }
    // Nothing on the element: the nearest ancestor that declares it is where an inherited value comes from.
    for (const [i, inh] of (m.inherited || []).entries()) {
      if (out.length) break;
      collect(inh.matchedCSSRules, `inherited from ancestor ${i + 1}: `);
    }
    const unique = [...new Set(out)];
    // Resolve custom properties the winning values use, on this element.
    const vars = [...new Set(unique.join(' ').match(/var\(--[\w-]+/g) || [])].map(v => v.slice(4));
    const varValues = await el.evaluate((n, names) => names.map(v => `${v} = ${getComputedStyle(n).getPropertyValue(v).trim()}`), vars);
    return [`computed ${a.prop}${a.states.map(st => ':' + st).join('')}: ${computed}`,
      out.length ? 'rules (cascade order, last non-overridden wins; !important beats normal):' : 'no rule declares it (default/initial value)',
      ...unique.map(l => '  ' + l),
      ...(varValues.length ? ['custom properties on this element:', ...varValues.map(l => '  ' + l)] : [])].join('\n');
  } finally {
    await el.evaluate(n => n.removeAttribute('data-pw-css')).catch(() => {});
    await cdp.detach().catch(() => {});
  }
}
