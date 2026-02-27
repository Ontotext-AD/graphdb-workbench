/* eslint-disable no-undef */
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawnSync, SpawnSyncReturns } from 'child_process';

interface Report {
  reports: any;
  conflictGroups: any;
}

describe('translation-report script', () => {
  const scriptPath = path.resolve(__dirname, '../scripts/validate-translations.js');
  const fixturesDir = path.resolve(__dirname, 'fixtures', 'packages');
  let tmpDir: string | null = null;

  afterEach(() => {
    if (tmpDir !== null && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  test('valid package', () => {
    const { tmp, result } = run('pkg-valid');
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/All translations are valid/);
    const report = readReport(tmp);
    expect(report.reports).toEqual({});
  });

  test('missing keys', () => {
    const { tmp, result } = run('pkg-invalid');
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Issues found/);
    const report = readReport(tmp);
    expect(report.reports['pkg-invalid'].fr.missingKeys).toContain('key2');
  });

  test('locale-xx.json is accepted', () => {
    const { tmp, result } = run('pkg-locale');
    expect(result.status).toBe(0);
    const report = readReport(tmp);
    // no errors and locale "de" present
    expect(report.conflictGroups).toHaveProperty('de');
  });

  test('conflict groups', () => {
    const { tmp, result } = run(['pkg-valid', 'pkg-conflict']);
    expect(result.status).toBe(0);
    const report = readReport(tmp);
    // expecting a group for the two packages under "en"
    const groups = Object.values(report.conflictGroups.en);
    expect(groups.some((group: any) => group.duplicatedKeys.includes('hello'))).toBe(true);
  });

  const run = (pkgs: string | string[]): { tmp: string; result: SpawnSyncReturns<string> } => {
    const names = Array.isArray(pkgs) ? pkgs : [pkgs];
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-'));
    tmpDir = tmp;
    const dest = path.join(tmp, 'packages');
    fs.mkdirSync(dest, { recursive: true });

    names.forEach((pkg) => {
      fs.cpSync(path.join(fixturesDir, pkg), path.join(dest, pkg), { recursive: true });
    });

    const result = spawnSync('node', [scriptPath], {
      env: { ...process.env, SCRIPT_ROOT: tmp },
      encoding: 'utf8'
    });

    return { tmp, result };
  };


  const readReport = (tmp: string): Report => {
    const reportPath = path.join(tmp, 'translation-report.json');
    return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  };
});

