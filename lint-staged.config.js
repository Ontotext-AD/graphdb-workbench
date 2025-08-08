module.exports = {
  'packages/api/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --config packages/api/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/legacy-workbench/src/**/*.js': (files) => [
    `eslint --config packages/legacy-workbench/eslint.config.mjs --max-warnings=0 --quiet ${files.join(' ')}`
  ],
  'packages/root-config/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --config packages/root-config/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/shared-components/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --config packages/shared-components/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
  'packages/workbench/src/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --config packages/workbench/eslint.config.js --max-warnings=0 ${files.join(' ')}`
  ],
};
