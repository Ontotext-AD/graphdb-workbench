import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';

const path = `${__dirname}/src/pages/fake-server.js`;

export const config: Config = {
  namespace: 'shared-components',
  sourceMap: false,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
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
        {src: '../../root-config/src/vendor/font-awesome', dest: 'pages/css'},
        {src: '../../api/dist/ontotext-workbench-api.js', dest: 'resources/ontotext-workbench-api.js'},
      ]
    },
  ],
  testing: {
    browserHeadless: 'shell',
    moduleNameMapper: {
      '^@ontotext/workbench-api$': '<rootDir>/../api/dist/ontotext-workbench-api.d.ts',
    },
    moduleDirectories: ["node_modules"],
    modulePathIgnorePatterns: ["<rootDir>/cypress/"],
    transform: {
      '^.+\\.(js|mjs|jsx|ts|tsx)$': 'ts-jest',
    },
  },
  plugins: [
    sass(),
  ],
  devServer: {
    requestListenerPath: path
  },
  // https://github.com/stenciljs/core/issues/4284
  // https://github.com/stenciljs/core/issues/5215
  // The main slot was not appearing in the DOM
  extras: {
    experimentalSlotFixes: true
  }
};
