import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';

const path = `${__dirname}/src/pages/fake-server.js`;

export const config: Config = {
  namespace: 'shared-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      dir: 'components-dist',
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
        {src: '../node_modules/font-awesome/css/', dest: 'pages/css'},
        {src: '../node_modules/font-awesome/fonts/', dest: 'pages/fonts'},
        {src: '../../api/dist/ontotext-workbench-api.js', dest: 'resources/ontotext-workbench-api.js'},
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
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
  }
};
