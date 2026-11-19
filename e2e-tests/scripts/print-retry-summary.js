// Prints one retry summary for a Cypress run split into parallel shards, as if it was a single run. Reads the retry
// files the shards write (report/retries). The test results are in the Jenkins Test Result page.
// Usage, from e2e-tests: node scripts/print-retry-summary.js

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const RETRIES_DIR = 'report/retries';

const files = existsSync(RETRIES_DIR) ? readdirSync(RETRIES_DIR).filter((file) => file.endsWith('.json')) : [];

// The retry files of all shards, merged.
const retries = files.map((file) => JSON.parse(readFileSync(join(RETRIES_DIR, file), 'utf8')))
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
