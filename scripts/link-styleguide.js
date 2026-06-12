// Links the graphwise-styleguide project locally in the root-config module.
// This allows you to test changes in the styleguide without needing to publish it.

// Default styleguide path is resolved as a sibling directory named "graphwise-styleguide".
// Can be overridden via STYLEGUIDE_PATH env var or CLI arg.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKBENCH_ROOT = path.resolve(__dirname, '..');
const DEFAULT_STYLEGUIDE_PATH = path.resolve(WORKBENCH_ROOT, '../graphwise-styleguide');

const STYLEGUIDE_PATH =
  process.argv[2] ||
  process.env.STYLEGUIDE_PATH ||
  DEFAULT_STYLEGUIDE_PATH;

if (!fs.existsSync(STYLEGUIDE_PATH) || !fs.statSync(STYLEGUIDE_PATH).isDirectory()) {
  console.error(`\n[ERROR] Styleguide directory not found: ${STYLEGUIDE_PATH}`);
  console.error('Pass the path as a CLI arg or set the STYLEGUIDE_PATH env var.\n');
  process.exit(1);
}

const ROOT_CONFIG_PATH = path.resolve(__dirname, '../packages/root-config');
const BRANCH = process.env.STYLEGUIDE_BRANCH || 'gw-theme';

if (!/^[0-9A-Za-z._/-]+$/.test(BRANCH)) {
  console.error(`\n[ERROR] Invalid STYLEGUIDE_BRANCH value: ${BRANCH}`);
  process.exit(1);
}
function run(cmd, cwd = process.cwd()) {
  console.log(`\n> ${cmd}  (in ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log(`\n=== Styleguide path: ${STYLEGUIDE_PATH} ===`);

// 1. Pull latest from the branch
run(`git fetch origin`, STYLEGUIDE_PATH);
run(`git checkout ${BRANCH}`, STYLEGUIDE_PATH);
run(`git pull origin ${BRANCH}`, STYLEGUIDE_PATH);

// 2. Build
run(`npm run build`, STYLEGUIDE_PATH);

// 3. Register the global npm link
run(`npm link`, STYLEGUIDE_PATH);

// 4. Link into root-config
run(`npm link graphwise-styleguide`, ROOT_CONFIG_PATH);

console.log('\n=== Done. You can now run: npm run start ===\n');
