const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {},
  output: {
    path: path.resolve(__dirname, 'dist', 'style-themes'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'css'),
          to: path.resolve(__dirname, 'dist', 'style-themes')
        },
      ],
    }),
  ],
};
