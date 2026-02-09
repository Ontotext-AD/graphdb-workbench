const config = {
  // show each test name in output
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.{js,ts}'],
  preset: 'ts-jest/presets/js-with-ts',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        esModuleInterop: true,
        skipLibCheck: true,
      }
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};

module.exports = config;
