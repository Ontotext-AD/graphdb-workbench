// Route sweep for smoke.sh; not meant to be run directly.
// Usage: node smoke.cjs --base URL --out DIR [--repo ID] [--theme T] [--viewport WxH] [--settle MS]
//                       [--baseline smoke.json] [route...]
// No routes: every route the served build registers (legacy PluginRegistry 'route' urls without parameters,
// plus the Angular app's routes), read from the running page.
const fs = require('fs');
const path = require('path');
const {parseArgs, launch, settle, loadNoise} = require('./lib.cjs');

const o = parseArgs(process.argv.slice(2));
const base = o.base.replace(/\/$/, '');
const origin = new URL(base).origin;
const settleMs = Number(o.settle || 1500);
const noise = loadNoise();
const isNoise = (line) => noise.some((re) => re.test(line));
// Comparable across stacks: no origin/port, cache-buster, timestamps or repository id.
const norm = (l) => l.replaceAll(origin, '').replace(/\?v=[^\s&]+/g, '')
    .replace(/\[\d+\/\d+\/\d+, [\d:]+\s*[AP]?M?\]/g, '[time]').replace(/verify-[\w-]+/g, 'verify-*');
// --baseline: errors already present in that sweep (same route) are reported as old, not failed.
const known = {};
if (o.baseline) {
    for (const r of JSON.parse(fs.readFileSync(o.baseline, 'utf8'))) known[r.route] = new Set(r.all);
}
const ANGULAR_ROUTES = ['/sparql', '/graph-navigator'];   // packages/workbench/src/app/app.routes.ts

(async () => {
    const {browser, ctx} = await launch({viewport: o.viewport, repo: o.repo, theme: o.theme});
    const page = await ctx.newPage();
    let events = [];
    page.on('console', (m) => m.type() === 'error' && events.push(`console: ${m.text()} @ ${m.location().url || ''}`));
    page.on('pageerror', (e) => events.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => r.url().startsWith(origin) &&
        events.push(`request: ${r.failure()?.errorText || 'failed'} ${r.method()} ${r.url()}`));
    page.on('response', (r) => r.url().startsWith(origin) && r.status() >= 400 &&
        events.push(`request: ${r.status()} ${r.request().method()} ${r.url()}`));

    let routes = o._;
    if (!routes.length) {
        await page.goto(`${base}/`, {waitUntil: 'domcontentloaded'});
        await settle(page, settleMs);
        const legacy = await page.evaluate(() => window.PluginRegistry.get('route').map((r) => r.url)).catch(() => []);
        if (!legacy.length) { console.error('FAIL: cannot read PluginRegistry routes from the page'); process.exit(2); }
        routes = [...new Set(['/', ...legacy.filter((u) => !/[:*]/.test(u)), ...ANGULAR_ROUTES])];
    }
    routes = routes.map((r) => `/${r.replace(/^\//, '')}`);

    const rows = [];
    for (const route of routes) {
        events = [];
        const shot = `smoke${route.replace(/\W+/g, '_')}.png`.replace('smoke_.png', 'smoke_home.png');
        let status = '';
        try {
            const resp = await page.goto(base + route, {waitUntil: 'domcontentloaded', timeout: 30000});
            status = resp ? resp.status() : '';
            await settle(page, settleMs);
        } catch (e) { events.push(`pageerror: navigation ${e.message.split('\n')[0]}`); }
        const info = await page.evaluate(() => {
            const h = [...document.querySelectorAll('h1')].find((e) => e.offsetParent !== null);
            return {h1: (h ? h.textContent : '').trim().replace(/\s+/g, ' '), title: document.title,
                path: location.pathname};
        }).catch(() => ({h1: '', title: '', path: ''}));
        await page.screenshot({path: path.join(o.out, shot), animations: 'disabled', caret: 'hide'}).catch(() => {});
        const uniq = [...new Set(events)];
        const all = uniq.filter((l) => !isNoise(l));
        const errors = o.baseline ? all.filter((l) => !(known[route] || new Set()).has(norm(l))) : all;
        rows.push({route, status, ...info, errors, old: all.length - errors.length, all: all.map(norm),
            noise: uniq.length - all.length, screenshot: shot});
    }
    await browser.close();
    fs.writeFileSync(path.join(o.out, 'smoke.json'), JSON.stringify(rows, null, 2));

    const w = Math.max(...rows.map((r) => r.route.length), 5);
    const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
    console.log(`${'route'.padEnd(w)}  new  old  noise  ${'h1'.padEnd(32)}  landed on`);
    for (const r of rows) {
        const moved = r.path && r.path.replace(new URL(base).pathname.replace(/\/$/, ''), '') !== r.route ? r.path : '';
        console.log(`${r.route.padEnd(w)}  ${String(r.errors.length).padStart(3)}  ${String(r.old).padStart(3)}  ${String(r.noise).padStart(5)}  ` +
            `${cut(r.h1 || '(no h1)', 32).padEnd(32)}  ${moved}`);
    }
    const bad = rows.filter((r) => r.errors.length);
    for (const r of bad) {
        console.log(`\nFAIL ${r.route}`);
        r.errors.slice(0, 8).forEach((e) => console.log(`  ${cut(e, 220)}`));
        if (r.errors.length > 8) console.log(`  … ${r.errors.length - 8} more in smoke.json`);
    }
    console.log(bad.length ? `\nFAIL ${bad.length}/${rows.length} routes with new errors` :
        `\nOK    ${rows.length} routes, no new errors (outside noise.txt${o.baseline ? ' and the baseline' : ''})`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
