const { execSync } = require('child_process');

const split = process.env.SPLIT;
const splitIndex = process.env.SPLIT_INDEX;
const splitFile = process.env.SPLIT_FILE || 'timings.json ';

console.info(`Running Cypress for split ${splitIndex}`);

// To enable Testcontainers debug output, set the DEBUG environment variable to "testcontainers*".
// For example:
//   DEBUG=testcontainers* SPLIT_FILE=${splitFile} SPLIT=${split} SPLIT_INDEX=${splitIndex} cypress run ...
execSync(`SPLIT_FILE=${splitFile} SPLIT=${split} SPLIT_INDEX=${splitIndex} cypress run --config-file cypress-testcontainers.config.js --browser chrome`, {
  stdio: 'inherit'
});
