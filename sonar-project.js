const argv = require('minimist')(process.argv.slice(2));
const sonarqubeScanner = require("sonarqube-scanner");

const branch = argv['branch'];
const targetBranch = argv['target-branch'];
const pullRequestId = argv['pull-request-id'];

const sonarOptions = {
  "sonar.organization": "ontotext-ad",
  "sonar.projectKey": "Ontotext-AD_graphdb-workbench",
  "sonar.projectName": "graphdb-workbench",
  "sonar.sources": "./src",
  "sonar.exclusions": "src/res/**/*,src/font/**/*,src/js/lib/**/*,src/css/fonts/**/*,src/css/lib/**/*",
  "sonar.tests": "test",
  "sonar.language": "js",
  "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
  "sonar.scm.provider": "git",
  "sonar.sourceEncoding": "UTF-8",
};

if (pullRequestId) {
  sonarOptions['sonar.pullrequest.key'] = `${pullRequestId}`;
  sonarOptions['sonar.pullrequest.branch'] = `${branch}`;
  sonarOptions['sonar.pullrequest.base'] = `${targetBranch}`;
} else {
  sonarOptions["sonar.branch.name"] = branch;
}

sonarqubeScanner(
  {
    options: sonarOptions
  },
  () => {
    console.log('Finished SonarQube scan');
  },
);
