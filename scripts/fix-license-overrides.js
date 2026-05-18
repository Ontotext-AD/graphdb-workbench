#!/usr/bin/env node

/**
 * Post-processes a license-checker JSON output file and applies license overrides
 * from license-checker/license-checker-overrides.json.
 *
 * Usage: node scripts/fix-license-overrides.js <path-to-license-checker-output.json>
 *
 * The overrides file uses "packageName@version" as keys, matching the keys
 * produced by license-checker in its JSON output.
 */

const fs = require('fs');
const path = require('path');

const outputFile = process.argv[2];
if (!outputFile) {
    console.error('Usage: node scripts/fix-license-overrides.js <path-to-license-checker-output.json>');
    process.exit(1);
}

const overridesFile = path.resolve(__dirname, '../license-checker/license-checker-overrides.json');

if (!fs.existsSync(outputFile)) {
    console.error(`Output file not found: ${outputFile}`);
    process.exit(1);
}

if (!fs.existsSync(overridesFile)) {
    console.error(`Overrides file not found: ${overridesFile}`);
    process.exit(1);
}

const output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
const overrides = JSON.parse(fs.readFileSync(overridesFile, 'utf8'));

let changed = 0;
for (const [pkg, override] of Object.entries(overrides)) {
    if (output[pkg]) {
        Object.assign(output[pkg], override);
        changed++;
        console.log(`Applied license override for ${pkg}: ${override.licenses}`);
    }
}

if (changed > 0) {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Updated ${changed} license override(s) in ${outputFile}`);
} else {
    console.log(`No matching packages found in ${outputFile} for overrides.`);
}

