// Prints one result table and one retry summary for a Cypress run split into parallel shards, as if it was a single
// run. Reads the JUnit files of all shards (cypress/results) and the retry files they write (report/retries).
// Usage, from e2e-tests: node scripts/print-summary.js

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const RESULTS_DIR = 'cypress/results';
const RETRIES_DIR = 'report/retries';

const attribute = (xml, name) => {
    const match = xml.match(new RegExp(`\\s${name}="([^"]*)"`));
    return match ? match[1] : undefined;
};

const readFiles = (dir, extension) => existsSync(dir)
    ? readdirSync(dir).filter((file) => file.endsWith(extension)).map((file) => readFileSync(join(dir, file), 'utf8'))
    : [];

// mocha-junit-reporter writes one file per spec: the root <testsuites> has the totals, the first <testsuite> the spec.
const specs = readFiles(RESULTS_DIR, '.xml').map((xml) => {
    const root = xml.match(/<testsuites[^>]*>/)[0];
    const firstSuite = xml.match(/<testsuite\s[^>]*>/)[0];
    const tests = Number(attribute(root, 'tests') || 0);
    const failing = Number(attribute(root, 'failures') || 0);
    const skipped = Number(attribute(root, 'skipped') || 0);
    return {
        spec: (attribute(firstSuite, 'file') || '?').replace(/^e2e-legacy\//, ''),
        tests,
        passing: tests - failing - skipped,
        failing,
        skipped,
        time: Number(attribute(root, 'time') || 0)
    };
}).sort((a, b) => a.spec.localeCompare(b.spec));

const formatTime = (seconds) => {
    const total = Math.round(seconds);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const row = (mark, spec, values) => `  ${mark} ${spec.padEnd(70)}${values.map((value) => String(value).padStart(9)).join('')}`;

const totals = specs.reduce((sum, spec) => ({
    tests: sum.tests + spec.tests,
    passing: sum.passing + spec.passing,
    failing: sum.failing + spec.failing,
    skipped: sum.skipped + spec.skipped,
    time: sum.time + spec.time
}), {tests: 0, passing: 0, failing: 0, skipped: 0, time: 0});

console.log('\n==============================   Run Summary (all shards)   ==============================\n');
console.log(row(' ', 'Spec', ['Time', 'Tests', 'Passing', 'Failing', 'Skipped']));
specs.forEach((spec) => console.log(row(spec.failing ? '✖' : '✔', spec.spec,
    [formatTime(spec.time), spec.tests, spec.passing, spec.failing || '-', spec.skipped || '-'])));
const failedSpecs = specs.filter((spec) => spec.failing).length;
console.log(row(failedSpecs ? '✖' : '✔', failedSpecs ? `${failedSpecs} of ${specs.length} specs failed` : `All ${specs.length} specs passed`,
    [formatTime(totals.time), totals.tests, totals.passing, totals.failing || '-', totals.skipped || '-']));

// The retry files of all shards, merged.
const retries = readFiles(RETRIES_DIR, '.json').map((json) => JSON.parse(json))
    .reduce((merged, shard) => ({
        flaky: {...merged.flaky, ...shard.flaky},
        broken: {...merged.broken, ...shard.broken}
    }), {flaky: {}, broken: {}});

const printGroup = (label, group) => {
    const entries = Object.entries(group);
    if (entries.length === 0) {
        return;
    }
    console.log(`\n ${label} (${entries.length}):`);
    entries.forEach(([name, retry]) => {
        console.log(`  * ${name}`);
        console.log(`    ↪ retried ${retry} time(s), total runs: ${retry + 1}`);
    });
};

console.log('\n==============================   Retry Summary (all shards)   ============================');
if (Object.keys(retries.flaky).length === 0 && Object.keys(retries.broken).length === 0) {
    console.log(' [PASS] No retried tests!');
}
printGroup('[WARNING] Flaky tests', retries.flaky);
printGroup('[FAIL] Broken tests', retries.broken);
console.log('==========================================================================================\n');
