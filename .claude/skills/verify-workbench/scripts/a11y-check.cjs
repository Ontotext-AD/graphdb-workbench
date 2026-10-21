// Runs the IBM Equal Access engine (WCAG_2_2 rule set, the checker named in GDB-14287's definition of done)
// on each page and writes <out>/a11y-report.json. Called by a11y.sh; not meant to be run directly.
// Usage: node a11y-check.cjs <base-url> <repo-id|-> <out-dir> <route>...
const fs = require('fs');
const path = require('path');
const {chromium} = require(process.env.PW_CORE);
const ACE = require.resolve('accessibility-checker-engine/ace.js', {paths: [process.env.A11Y_HOME]});

const [base, repo, out, ...routes] = process.argv.slice(2);

(async () => {
    const browser = await chromium.launch({executablePath: process.env.A11Y_CHROME, headless: true});
    const ctx = await browser.newContext({viewport: {width: 1440, height: 900}});
    if (repo !== '-') {
        await ctx.addInitScript((id) => localStorage.setItem('ontotext.gdb.repository.selectedRepository',
            JSON.stringify({id, location: ''})), repo);
    }
    const page = await ctx.newPage();
    const report = [];
    let failures = 0;
    for (const route of routes) {
        await page.goto(`${base}/${route.replace(/^\//, '')}`, {waitUntil: 'networkidle'});
        await page.waitForTimeout(Number(process.env.A11Y_SETTLE_MS || 3000));
        await page.addScriptTag({path: ACE});
        const results = await page.evaluate(async () => {
            const r = await new window.ace.Checker().check(document, ['WCAG_2_2']);
            return r.results.filter((x) => x.value[1] !== 'PASS').map((x) => ({
                level: `${x.value[0]}/${x.value[1]}`, rule: x.ruleId, message: x.message,
                xpath: x.path.dom, snippet: (x.snippet || '').slice(0, 200)
            }));
        });
        await page.screenshot({path: path.join(out, `a11y-${route.replace(/\W+/g, '_') || 'home'}.png`)});
        const violations = results.filter((x) => x.level === 'VIOLATION/FAIL');
        failures += violations.length;
        report.push({route, violations: violations.length, results});
        console.log(`\n=== /${route.replace(/^\//, '')}  violations: ${violations.length}  (other non-pass: ${results.length - violations.length})`);
        for (const v of violations) {
            console.log(`- [${v.rule}] ${v.message}\n    ${v.xpath}\n    ${v.snippet}`);
        }
    }
    fs.writeFileSync(path.join(out, 'a11y-report.json'), JSON.stringify(report, null, 2));
    await browser.close();
    process.exit(failures ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
