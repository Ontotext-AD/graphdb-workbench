// Removes the npm link for graphwise-styleguide in packages/root-config
// and restores the published version from the registry.

const { execSync } = require('child_process');
const path = require('path');

const ROOT_CONFIG_PATH = path.resolve(__dirname, '../packages/root-config');

function run(cmd, cwd = process.cwd()) {
  console.log(`\n> ${cmd}  (in ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. Unlink (removes the symlink)
run(`npm unlink --no-save graphwise-styleguide`, ROOT_CONFIG_PATH);

// 2. Reinstall the published version declared in package.json
run(`npm ci`, ROOT_CONFIG_PATH);

console.log('\n=== graphwise-styleguide restored to published version ===\n');
