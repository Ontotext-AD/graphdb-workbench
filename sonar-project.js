const argv = require('minimist')(process.argv.slice(2));
const sonarqubeScanner = require('sonarqube-scanner');

const branch = argv['branch'];
const targetBranch = argv['target-branch'];
const pullRequestId = argv['pull-request-id'];
const sourcePaths = [
  './packages/api/src',
  './packages/legacy-workbench/src',
  './packages/root-config/src',
  './packages/shared-components/src',
  './packages/workbench/src',
];
const exclusionPaths = [
  './packages/api/src/assets/**/*',
  './packages/legacy-workbench/src/res/**/*',
  './packages/legacy-workbench/src/font/**/*',
  './packages/legacy-workbench/src/js/lib/**/*',
  './packages/legacy-workbench/src/css/fonts/**/*',
  './packages/legacy-workbench/src/css/lib/**/*',
  './packages/root-config/src/assets/**/*',
  './packages/shared-components/src/assets/**/*',
  './packages/workbench/src/assets/**/*',
];

const sonarOptions = {
  'sonar.organization': 'ontotext-ad',
  'sonar.projectKey': 'Ontotext-AD_WB_migration_workbench',
  'sonar.projectName': 'Shared-components',
  'sonar.sources': sourcePaths.join(','),
  'sonar.exclusions': exclusionPaths.join(','),
  'sonar.scm.provider': 'git',
  'sonar.sourceEncoding': 'UTF-8'
};

if (pullRequestId) {
  sonarOptions['sonar.pullrequest.key'] = `${pullRequestId}`;
  sonarOptions['sonar.pullrequest.branch'] = `${branch}`;
  sonarOptions['sonar.pullrequest.base'] = `${targetBranch}`;
} else {
  sonarOptions['sonar.branch.name'] = branch;
}

sonarqubeScanner(
  {
    options: sonarOptions
  },
  () => {
    console.log('Finished SonarQube scan');
  },
);
