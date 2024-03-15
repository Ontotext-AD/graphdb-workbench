pipeline {

  agent {
    label 'graphdb-jenkins-node'
  }

  tools {
    nodejs 'nodejs-20.11.1'
  }

  environment {
    CI = "true"
    NEXUS_CREDENTIALS = credentials('nexus-kim-user')
    // Needed for our version of webpack + newer nodejs
    NODE_OPTIONS = "--openssl-legacy-provider"
    // Tells NPM and co. not to use color output (looks like garbage in Jenkins)
    NO_COLOR = "1"
  }

  stages {

    stage('Install') {
      steps {
        sh "npm install"
      }
    }

//     stage('Test') {
//       steps {
//         sh "sudo apt-get install libgbm1 gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget --assume-yes"
        // passing --no-colors to karma to suppress color output that shows as garbage in Jenkins
//         sh "npm run test:coverage -- --no-colors"
//       }
//     }

    stage('Build') {
      steps {
        sh "npm run build"
      }
    }

    stage('Sonar') {
      steps {
        withSonarQubeEnv('SonarCloud') {
          sh "node sonar-project.js --branch='${env.ghprbSourceBranch}' --target-branch='${env.ghprbTargetBranch}' --pull-request-id='${env.ghprbPullId}'"
        }
      }
    }


    stage('Acceptance') {
      steps {
        configFileProvider(
                [configFile(fileId: 'ceb7e555-a3d9-47c7-9afe-d008fd9efb14', targetLocation: 'graphdb.license')]) {
          sh 'cp graphdb.license ./test-cypress/fixtures/'
        }
          sh "ls ./test-cypress/fixtures/"
          // --no-ansi suppresses color output that shows as garbage in Jenkins
          sh "docker-compose --no-ansi build --force-rm --no-cache --parallel"
          sh "docker-compose --no-ansi up --abort-on-container-exit --exit-code-from cypress-tests"

          // Fix coverage permissions
          sh "sudo chown -R \$(id -u):\$(id -g) coverage/"
          sh "sudo chown -R \$(id -u):\$(id -g) cypress/"
          sh "sudo chown -R \$(id -u):\$(id -g) report/"

          // Move up to be picked by Sonar
//           sh "mv test-cypress/coverage/ cypress-coverage/"
//           sh "sync"
//
//           // Update relative paths to absolute path
//           sh "sed -i.backup \"s@^SF:..@SF:\$(pwd)@\" cypress-coverage/lcov.info"
      }
    }
  }

  post {
    always {
      // upload failed tests report and artifacts
      junit allowEmptyResults: true, testResults: 'cypress/results/**/*.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'report/screenshots/**/*.png, report/videos/**/*.mp4, cypress/logs/*.log'

      // --no-ansi suppresses color output that shows as garbage in Jenkins
      sh "docker-compose --no-ansi down -v --remove-orphans --rmi=local || true"
      // clean root owned resources from docker volumes, just in case
      sh "sudo rm -rf ./coverage"
      sh "sudo rm -rf ./cypress"
      sh "sudo rm -rf ./report"
    }
  }
}

