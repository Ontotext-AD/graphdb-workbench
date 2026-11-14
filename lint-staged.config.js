module.exports = {
  'packages/api/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `npx eslint --config packages/api/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/legacy-workbench/src/**/*.js': (files) => [
    `npx eslint --config packages/legacy-workbench/eslint.config.cjs --max-warnings=0 --quiet ${files.join(' ')}`
  ],
  'packages/root-config/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `npx eslint --config packages/root-config/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/shared-components/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `npx eslint --config packages/shared-components/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/workbench/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `npx eslint --config packages/workbench/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'e2e-tests/**/*.{js,mjs,cjs}': (files) => [
    `npx eslint --config e2e-tests/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/shared-components/src/**/*.scss': (files) => [
    `npx stylelint --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/workbench/src/**/*.scss': (files) => [
    `npx stylelint --max-warnings=0 ${files.join(' ')}`
  ],
  // Fails when a staged file uses a --gw-* token that graphwise-styleguide does not define.
  'packages/*/src/**/*.{css,scss,less,ts,tsx,js,jsx,html,ejs}': (files) => [
    `node scripts/check-styleguide-tokens.js ${files.join(' ')}`
  ],
  // A styleguide upgrade can remove tokens, so all the sources are checked.
  'packages/root-config/package.json': () => [
    'node scripts/check-styleguide-tokens.js'
  ],
};
