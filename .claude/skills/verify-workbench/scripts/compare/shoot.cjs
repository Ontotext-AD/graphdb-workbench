// Screenshots of one side for compare.sh; not meant to be run directly.
// Usage: node shoot.cjs --base URL --out DIR [--repo ID] [--theme T] [--viewport WxH] [--settle MS]
//                       [--mark SELECTOR] [--full-page] [--steps FILE.cjs] [name=route | route ...]
// --steps FILE.cjs: module.exports = async ({page, go, shot, mark}) => { ... }
//   go(route)                  navigate to <base>/<route> and settle
//   shot(name, {mark, caption, fullPage})  settle, optionally box elements, screenshot <out>/<name>.png
//   mark(selector, caption)    box elements until the next shot
// Prints one "<name>\t<route>" line per screenshot.
const path = require('path');
const {parseArgs, launch, settle, mark, unmark} = require('./lib.cjs');

const o = parseArgs(process.argv.slice(2), ['full-page']);
const base = o.base.replace(/\/$/, '');
const settleMs = Number(o.settle || 1500);

(async () => {
    const {browser, ctx} = await launch({viewport: o.viewport, repo: o.repo, theme: o.theme});
    const page = await ctx.newPage();
    let route = '';
    const go = async (r) => {
        route = `/${r.replace(/^\//, '')}`;
        await page.goto(base + route, {waitUntil: 'domcontentloaded', timeout: 30000});
        await settle(page, settleMs);
    };
    const shot = async (name, opts = {}) => {
        await settle(page, 300);
        const sel = opts.mark || o.mark;
        if (sel && !(await mark(page, sel, opts.caption))) console.error(`WARN  ${name}: no visible element matches ${sel}`);
        await page.screenshot({path: path.join(o.out, `${name}.png`), fullPage: !!(opts.fullPage ?? o['full-page']),
            animations: 'disabled', caret: 'hide'});
        await unmark(page);
        console.log(`${name}\t${route}`);
    };
    if (o.steps) {
        await require(path.resolve(o.steps))({page, go, shot, mark: (s, c) => mark(page, s, c)});
    } else {
        for (const spec of o._) {
            const [name, r] = spec.includes('=') ? spec.split(/=(.*)/s) : [spec.replace(/\W+/g, '_') || 'home', spec];
            await go(r);
            await shot(name.replace(/^_+|_+$/g, '') || 'home');
        }
    }
    await browser.close();
})().catch((e) => { console.error(e); process.exit(2); });
