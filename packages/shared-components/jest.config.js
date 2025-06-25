const {createJestStencilPreset} = require('jest-stencil-runner');

module.exports = createJestStencilPreset({
  moduleNameMapper: {
    '^@ontotext/workbench-api$': '<rootDir>/../api/dist/ontotext-workbench-api.d.ts',
  },
  rootDir: __dirname,
  // Add any additional Jest configuration here
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testMatch: [
    '**/*.(test|spec).(ts|tsx|js)'
  ],
});
