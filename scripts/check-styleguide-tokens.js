// Fails when the code uses a --gw-* token that graphwise-styleguide does not define.
// An undefined token is not an error in the browser: the property silently falls back, so the styles look wrong.

// Usage: node scripts/check-styleguide-tokens.js [files...]
// Without files, it checks the sources of all packages (packages/*/src).
// The styleguide dist folder can be overridden via the STYLEGUIDE_DIST env var.

const fs = require('fs');
const path = require('path');

const WORKBENCH_ROOT = path.resolve(__dirname, '..');
const STYLEGUIDE_DIST =
  process.env.STYLEGUIDE_DIST ||
  path.join(WORKBENCH_ROOT, 'packages/root-config/node_modules/graphwise-styleguide/dist');

const SOURCE_FILE = /\.(css|scss|less|ts|tsx|js|jsx|html|ejs)$/;
const IGNORED_DIR = /(^|[\\/])(node_modules|dist)[\\/]/;
const TOKEN_DEFINITION =/(--gw-[\w-]+)\s*:/g;
// A name followed by SCSS interpolation (--gw-body-#{$size}-font-size) is known only after compiling, so it is skipped.
// The lookahead also keeps the match from backtracking to a shorter name.
const TOKEN_USAGE = /var\(\s*(--gw-[\w-]+)(?![\w-]|#\{)/g;

/**
 * Reads the tokens defined by the styleguide, in the light and the dark theme.
 * @returns {Set<string>}
 */
function readDefinedTokens() {
  const tokens = new Set();
  for (const fileName of ['variables-light.css', 'variables-dark.css']) {
    const css = fs.readFileSync(path.join(STYLEGUIDE_DIST, fileName), 'utf8');
    for (const match of css.matchAll(TOKEN_DEFINITION)) {
      tokens.add(match[1]);
    }
  }
  return tokens;
}

/**
 * Finds the tokens used in a file that are not in the defined tokens.
 * @param {string} filePath The file to check.
 * @param {Set<string>} definedTokens The tokens defined by the styleguide.
 * @returns {{token: string, line: number}[]}
 */
function findUndefinedTokens(filePath, definedTokens) {
  const undefinedTokens = [];
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.forEach((text, index) => {
    for (const match of text.matchAll(TOKEN_USAGE)) {
      if (!definedTokens.has(match[1])) {
        undefinedTokens.push({token: match[1], line: index + 1});
      }
    }
  });
  return undefinedTokens;
}

/**
 * Lists the source files of all packages (packages/x/src), recursively.
 * @returns {string[]}
 */
function listPackageSourceFiles() {
  const packagesDir = path.join(WORKBENCH_ROOT, 'packages');
  return fs.readdirSync(packagesDir)
    .map((packageName) => path.join(packagesDir, packageName, 'src'))
    .filter((srcDir) => fs.existsSync(srcDir))
    .flatMap((srcDir) => fs.readdirSync(srcDir, {recursive: true}).map((file) => path.join(srcDir, file)))
    .filter((file) => SOURCE_FILE.test(file) && !IGNORED_DIR.test(file) && fs.statSync(file).isFile())
    .map((file) => path.relative(WORKBENCH_ROOT, file));
}

const definedTokens = readDefinedTokens();
const files = process.argv.length > 2 ? process.argv.slice(2) : listPackageSourceFiles();
const problems = files.flatMap((file) =>
  findUndefinedTokens(file, definedTokens)
    .map((usage) => `  ${path.relative(WORKBENCH_ROOT, path.resolve(file))}:${usage.line}  ${usage.token}`)
);

if (problems.length > 0) {
  console.error('\n[ERROR] These --gw-* tokens are not defined by graphwise-styleguide:');
  problems.forEach((problem) => console.error(problem));
  process.exit(1);
}
