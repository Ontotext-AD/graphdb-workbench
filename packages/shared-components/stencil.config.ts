import {Config} from '@stencil/core';
import {sass} from '@stencil/sass';

export const config: Config = {
  namespace: 'shared-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        {src: 'pages'},
        {src: '../node_modules/font-awesome/css/', dest: 'pages/css'},
        {src: '../node_modules/font-awesome/fonts/', dest: 'pages/fonts'},
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
    moduleNameMapper: {
      '^@ontotext/workbench-api$': '<rootDir>/../api/dist/ontotext-workbench-api.d.ts',
    },
    moduleDirectories: ["node_modules"],
    transform: {
      '^.+\\.(js|mjs|jsx|ts|tsx)$': 'ts-jest',
    },
  },
  plugins: [
    sass(),
  ],
};
