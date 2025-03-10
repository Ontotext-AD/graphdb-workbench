// scripts/license-report.js
const { spawnSync } = require('child_process');

function runLicenseCheck() {
    const result = spawnSync(
        'license-checker',
        [
            '--production',
            '--json',
            '--customPath',
            'license-checker-format.json',
            '--out',
            'dist/license-checker.json',
        ],
        {
            stdio: 'inherit',
            shell: true
        }
    );
    if (result.status !== 0) {
        process.exit(result.status);
    }
}

runLicenseCheck();
