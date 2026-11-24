// Shared browser setup for compare.sh / smoke.sh. Playwright comes from the global @playwright/cli (PW_CORE).
const fs = require('fs');
const path = require('path');
const {chromium} = require(process.env.PW_CORE);

// --key value / --flag parser; everything after the flags (or after `--`) is positional.
function parseArgs(argv, flags = []) {
    const o = {_: []};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--') { o._.push(...argv.slice(i + 1)); break; }
        if (!a.startsWith('--')) { o._.push(a); continue; }
        const k = a.slice(2);
        if (flags.includes(k)) o[k] = true; else o[k] = argv[++i];
    }
    return o;
}

// Fresh context per side/run: same viewport, selected repository and theme are set before the app boots,
// so a new stack never starts with "no repository selected" or the OS theme.
async function launch({viewport = '1440x900', repo, theme}) {
    const [width, height] = viewport.split('x').map(Number);
    const browser = await chromium.launch({executablePath: process.env.PW_CHROME || undefined, headless: true});
    const ctx = await browser.newContext({viewport: {width, height}, colorScheme: theme === 'dark' ? 'dark' : 'light'});
    await ctx.addInitScript(({repo, theme}) => {
        if (repo) localStorage.setItem('ontotext.gdb.repository.selectedRepository', JSON.stringify({id: repo, location: ''}));
        if (theme) {
            const k = 'ontotext.gdb.application.settings';
            let s = {};
            try { s = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { /* fresh */ }
            localStorage.setItem(k, JSON.stringify({...s, themeMode: theme}));
        }
    }, {repo, theme});
    return {browser, ctx};
}

// Load and let the page settle: network idle (bounded), fonts, then a fixed quiet period.
async function settle(page, ms) {
    await page.waitForLoadState('networkidle', {timeout: 20000}).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(ms);
}

// Red box (+ optional caption) over every visible element matching selector. Removed by unmark().
async function mark(page, selector, caption) {
    return page.evaluate(({selector, caption}) => {
        let n = 0;
        for (const el of document.querySelectorAll(selector)) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            const box = document.createElement('div');
            box.className = 'verify-wb-mark';
            Object.assign(box.style, {position: 'fixed', left: `${r.left - 3}px`, top: `${r.top - 3}px`,
                width: `${r.width + 6}px`, height: `${r.height + 6}px`, border: '3px solid #e00',
                zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box'});
            if (caption) {
                const c = document.createElement('div');
                c.textContent = caption;
                Object.assign(c.style, {position: 'absolute', left: '-3px', top: '-22px', background: '#e00',
                    color: '#fff', font: 'bold 12px sans-serif', padding: '2px 6px', whiteSpace: 'nowrap'});
                box.appendChild(c);
            }
            document.body.appendChild(box);
            n++;
        }
        return n;
    }, {selector, caption});
}
const unmark = (page) => page.evaluate(() => document.querySelectorAll('.verify-wb-mark').forEach((e) => e.remove()));

// Known-noise patterns (one JS regex per line, # comments) matched against "console: <text> @ <url>" and
// "request: <status> <method> <url>" lines.
function loadNoise(file = path.join(__dirname, 'noise.txt')) {
    return fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#')).map((l) => new RegExp(l));
}

module.exports = {parseArgs, launch, settle, mark, unmark, loadNoise};
