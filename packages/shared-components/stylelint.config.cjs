const path = require('node:path');

module.exports = {
  extends: [path.resolve(__dirname, '../../stylelint.config.base.cjs')],
  ignoreFiles: ['**/node_modules/**', 'dist/**', 'src/pages/**']
};
