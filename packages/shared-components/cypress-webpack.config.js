const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@ontotext/workbench-api': path.resolve(__dirname, '../../packages/workbench-api'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
