const argv = require('minimist')(process.argv.slice(2));
const sonarqubeScanner = require("sonarqube-scanner");

const branch = argv['branch'];
const targetBranch = argv['target-branch'];
const pullRequestId = argv['pull-request-id'];

const sonarOptions = {
  "sonar.organization": "ontotext-ad",
  "sonar.sources": "./src",
  "sonar.exclusions": "src/res/**/*,src/font/**/*,src/js/lib/**/*,src/css/fonts/**/*,src/css/lib/**/*",
  "sonar.tests": "test",
  "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
  "sonar.scm.provider": "git",
};

if (pullRequestId) {
  sonarOptions['sonar.pullrequest.key'] = `${pullRequestId}`;
  sonarOptions['sonar.pullrequest.branch'] = branch;
  sonarOptions['sonar.pullrequest.base'] = targetBranch;
} else {
  sonarOptions["sonar.branch.name"] = branch;
}

// See https://nickkorbel.com/2020/02/05/configuring-sonar-with-a-create-react-app-in-typescript/
sonarqubeScanner(
  {
    options: sonarOptions
  },
  () => {
    console.log('Finished SonarQube scan');
  },
);
