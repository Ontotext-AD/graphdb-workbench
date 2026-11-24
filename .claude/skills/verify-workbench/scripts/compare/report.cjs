// Self-contained before/after page for compare.sh; not meant to be run directly.
// Usage: node report.cjs <dir> <title>   reads <dir>/results.tsv (name, route, ae, total, w, h) and
// <dir>/{before,after,diff}/<name>.png, writes <dir>/index.html with images inlined.
const fs = require('fs');
const path = require('path');

const [dir, title] = process.argv.slice(2);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const img = (side, name) => {
    const f = path.join(dir, side, `${name}.png`);
    return fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString('base64')}` : '';
};
const rows = fs.readFileSync(path.join(dir, 'results.tsv'), 'utf8').trim().split('\n').filter(Boolean)
    .map((l) => { const [name, route, ae, total, w, h] = l.split('\t'); return {name, route, ae, total, w, h}; });
const pct = (r) => (/^\d+$/.test(r.ae) ? `${((100 * r.ae) / r.total).toFixed(3)} %` : '');

const table = rows.map((r) => `<tr><td><a href="#${esc(r.name)}">${esc(r.name)}</a></td><td><code>${esc(r.route)}</code></td>
  <td class="n">${esc(r.ae)}</td><td class="n">${pct(r)}</td><td class="n">${esc(r.w)}×${esc(r.h)}</td></tr>`).join('');
const sections = rows.map((r) => `
<section id="${esc(r.name)}">
  <h2>${esc(r.name)} <code>${esc(r.route)}</code> <span class="ae">AE ${esc(r.ae)} px ${pct(r)}</span></h2>
  <div class="swipe" style="aspect-ratio:${r.w}/${r.h}">
    <img src="${img('after', r.name)}" alt="after">
    <img class="before" src="${img('before', r.name)}" alt="before">
    <div class="bar"></div>
    <input type="range" min="0" max="100" value="50" aria-label="swipe ${esc(r.name)}">
    <span class="tag l">before</span><span class="tag r">after</span>
  </div>
  <div class="sbs">
    <figure><figcaption>before</figcaption><img src="${img('before', r.name)}" alt=""></figure>
    <figure><figcaption>after</figcaption><img src="${img('after', r.name)}" alt=""></figure>
    <figure><figcaption>diff (red = changed)</figcaption><img src="${img('diff', r.name)}" alt=""></figure>
  </div>
</section>`).join('');

fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#fff;--fg:#1d1d1f;--mut:#666;--line:#ddd;--acc:#d00}
@media (prefers-color-scheme:dark){:root{--bg:#161618;--fg:#eee;--mut:#999;--line:#333;--acc:#ff5a5a}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}
main{max-width:1500px;margin:auto}
table{border-collapse:collapse;margin:8px 0 24px}td,th{border-bottom:1px solid var(--line);padding:4px 10px;text-align:left}
.n{text-align:right;font-variant-numeric:tabular-nums}a{color:inherit}
h1{font-size:20px}h2{font-size:16px;margin-top:32px}.ae{color:var(--acc);font-weight:normal;margin-left:8px}
.meta{color:var(--mut)}
.swipe{position:relative;width:100%;border:1px solid var(--line);overflow:hidden;--p:50}
.swipe img{display:block;width:100%;height:auto;user-select:none;pointer-events:none}
.swipe .before{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--p) * 1%) 0 0)}
.swipe .bar{position:absolute;top:0;bottom:0;left:calc(var(--p) * 1%);width:2px;background:var(--acc);pointer-events:none}
.swipe input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.tag{position:absolute;top:6px;background:#000a;color:#fff;padding:1px 6px;font-size:12px;pointer-events:none}
.tag.l{left:6px}.tag.r{right:6px}
.sbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;margin-top:8px}
.sbs figure{margin:0}.sbs img{width:100%;border:1px solid var(--line)}figcaption{color:var(--mut)}
</style></head><body><main>
<h1>${esc(title)}</h1>
<p class="meta">AE = pixels that differ (ImageMagick compare, fuzz shown in the title). Drag on an image to swipe.</p>
<table><thead><tr><th>shot</th><th>route</th><th class="n">AE px</th><th class="n">share</th><th class="n">size</th></tr></thead>
<tbody>${table}</tbody></table>
${sections}
</main>
<script>
document.querySelectorAll('.swipe').forEach((s) => {
  const i = s.querySelector('input');
  const set = () => s.style.setProperty('--p', i.value);
  i.addEventListener('input', set); set();
});
</script></body></html>
`);
console.log(path.join(dir, 'index.html'));
