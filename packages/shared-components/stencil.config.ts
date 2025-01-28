import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';
import istanbul from 'rollup-plugin-istanbul';

const path = `${__dirname}/src/pages/fake-server.js`;

export const config: Config = {
  namespace: 'shared-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    // {
    //   type: 'dist-custom-elements',
    //   customElementsExportBehavior: 'single-export-module',
    //   externalRuntime: false,
    // },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages'},
        {src: 'assets'},
        {src: '../node_modules/font-awesome/css/', dest: 'pages/css'},
        {src: '../node_modules/font-awesome/fonts/', dest: 'pages/fonts'},
        {src: '../../api/dist/ontotext-workbench-api.js', dest: 'resources/ontotext-workbench-api.js'},
      ]
    },
  ],
  testing: {
    browserHeadless: true,
    moduleNameMapper: {
      '^@ontotext/workbench-api$': '<rootDir>/../api/dist/ontotext-workbench-api.d.ts',
    },
    moduleDirectories: ["node_modules"],
    modulePathIgnorePatterns: ["<rootDir>/cypress/"],
    transform: {
      '^.+\\.(js|mjs|jsx|ts|tsx)$': 'ts-jest',
    },
    collectCoverage: true,
    coverageDirectory: ".nyc_output",
    coverageReporters: ["json"]
  },
  plugins: [
    sass(),
    istanbul({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['**/*.spec.ts', '**/*.e2e.ts', 'node_modules/**'],
      extension: ['.ts', '.tsx'],
    }),
  ],
  sourceMap: true,
  devServer: {
    requestListenerPath: path
  }
};
