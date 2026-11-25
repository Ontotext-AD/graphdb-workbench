// Prints one result table and one retry summary for a Cypress run split into parallel shards, as if it was a single
// run. Reads the JUnit files of all shards (cypress/results) and the retry files they write (report/retries).
// Usage, from e2e-tests: node scripts/print-summary.js

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import Table from 'cli-table3';

const RESULTS_DIR = 'cypress/results';
const RETRIES_DIR = 'report/retries';
const FAILED_SPECS_DIR = 'report/failed-specs';

const attribute = (xml, name) => {
    const match = xml.match(new RegExp(`\\s${name}="([^"]*)"`));
    return match ? match[1] : undefined;
};

const readFiles = (dir, extension) => existsSync(dir)
    ? readdirSync(dir).filter((file) => file.endsWith(extension)).map((file) => readFileSync(join(dir, file), 'utf8'))
    : [];

const specName = (path) => path.replace(/^e2e-legacy\//, '');

// mocha-junit-reporter writes one file per spec: the root <testsuites> has the totals, the first <testsuite> the spec
// and its start time.
const specs = readFiles(RESULTS_DIR, '.xml').map((xml) => {
    const root = xml.match(/<testsuites[^>]*>/)[0];
    const firstSuite = xml.match(/<testsuite\s[^>]*>/)[0];
    const tests = Number(attribute(root, 'tests') || 0);
    const failing = Number(attribute(root, 'failures') || 0);
    const skipped = Number(attribute(root, 'skipped') || 0);
    const time = Number(attribute(root, 'time') || 0);
    const start = new Date(attribute(firstSuite, 'timestamp')).getTime();
    return {
        spec: specName(attribute(firstSuite, 'file') || '?'),
        tests,
        passing: tests - failing - skipped,
        failing,
        skipped,
        time,
        start,
        end: start + time * 1000
    };
}).sort((a, b) => a.spec.localeCompare(b.spec));

// A spec that crashed before mocha ended wrote no JUnit file, but is in its shard's failed specs list.
const crashedSpecs = [...new Set(readFiles(FAILED_SPECS_DIR, '.txt')
    .flatMap((list) => list.split('\n').filter(Boolean).map(specName)))]
    .filter((spec) => !specs.some((result) => result.spec === spec))
    .sort();

const formatTime = (seconds) => {
    const total = Math.round(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = String(Math.floor(total % 3600 / 60)).padStart(2, '0');
    const rest = String(total % 60).padStart(2, '0');
    return hours ? `${hours}:${minutes}:${rest}` : `${minutes}:${rest}`;
};

const totals = specs.reduce((sum, spec) => ({
    tests: sum.tests + spec.tests,
    passing: sum.passing + spec.passing,
    failing: sum.failing + spec.failing,
    skipped: sum.skipped + spec.skipped,
    time: sum.time + spec.time
}), {tests: 0, passing: 0, failing: 0, skipped: 0, time: 0});

// No colours: the Jenkins log shows them as escape codes. No lines between the rows, as in the Cypress table.
const table = new Table({
    head: ['', 'Spec', 'Time', 'Tests', 'Passing', 'Failing', 'Skipped'],
    colAligns: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
    chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
    style: {head: [], border: []}
});
specs.forEach((spec) => table.push([spec.failing ? '✖' : '✔', spec.spec,
    formatTime(spec.time), spec.tests, spec.passing, spec.failing || '-', spec.skipped || '-']));
crashedSpecs.forEach((spec) => table.push(['✖', `${spec} (crashed, no results)`, '-', '-', '-', '-', '-']));
const allSpecs = specs.length + crashedSpecs.length;
const failedSpecs = specs.filter((spec) => spec.failing).length + crashedSpecs.length;
const crashedNote = crashedSpecs.length ? ` (${crashedSpecs.length} crashed)` : '';
table.push([failedSpecs ? '✖' : '✔', failedSpecs ? `${failedSpecs} of ${allSpecs} specs failed${crashedNote}` : `All ${allSpecs} specs passed`,
    formatTime(totals.time), totals.tests, totals.passing, totals.failing || '-', totals.skipped || '-']);

console.log('\n==============================   Run Summary (all shards)   ==============================\n');
console.log(table.toString());
if (specs.length) {
    const runTime = (Math.max(...specs.map((spec) => spec.end)) - Math.min(...specs.map((spec) => spec.start))) / 1000;
    console.log(`\n Run time: ${formatTime(runTime)}. Test time of all shards: ${formatTime(totals.time)}.`);
}

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
