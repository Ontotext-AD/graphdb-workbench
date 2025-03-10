@Library('ontotext-platform@v0.1.49') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    environment {
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
        // Tells NPM and co. not to use color output (looks like garbage in Jenkins)
        NO_COLOR = "1"
        SONAR_ENVIRONMENT = "SonarCloud"
        AGENT = "aws-large"
    }

    stages {
        stage('Install, Validate translations, Build') {
            steps {
                script {
                    try {
                        npm.install(scripts: ['validate-translations', 'build'])
                    } catch (e) {
                        archiveValidationArtifacts()
                    }
                }
            }
        }

        stage('Sonar') {
            steps {
                withSonarQubeEnv(SONAR_ENVIRONMENT) {
                    script {
                        try {
                            if (scmUtil.isMaster()) {
                                sh "node sonar-project.js --branch='${scmUtil.getCurrentBranch()}'"
                            } else {
                                sh "node sonar-project.js --branch='${scmUtil.getSourceBranch()}' --target-branch='${scmUtil.getTargetBranch()}' --pull-request-id='${scmUtil.getMergeRequestId()}'"
                            }
                        } catch (e) {
                            echo "Sonar analysis failed, but continuing the pipeline. Error: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

        stage('Acceptance') {
            steps {
                script {
                    if (!scmUtil.isMaster()) {
                        withKsm(application: [[
                            credentialsId: 'ksm-jenkins',
                            secrets: [
                                [
                                    destination: 'file',
                                    filePath: 'graphdb.license',
                                    notation: 'keeper://AByA4tIDmeN7RmqnQYGY0A/file/graphdb.license'
                                ]
                            ]
                        ]]) {
                            sh 'cp graphdb.license ./test-cypress/fixtures/'
                            sh "ls ./test-cypress/fixtures/"
                            dockerCompose.buildCmd(options: ["--force-rm", "--parallel"])
                            try {
                                dockerCompose.upCmd(options: ["--abort-on-container-exit", "--exit-code-from cypress-tests"])
                            } finally {
                                cleanup()
                            }
                        }
                    }
                }
            }
        }
    }
}

def cleanup() {
    // upload failed tests report and artifacts
    try {
        junit allowEmptyResults: true, testResults: 'cypress/results/**/*.xml'
    } catch (e) {
        echo "Test results not found: ${e.getMessage()}"
    }

    try {
        archiveArtifacts allowEmptyArchive: true, artifacts: 'report/screenshots/**/*.png, report/videos/**/*.mp4, cypress/logs/*.log'
    } catch (e) {
        echo "Artifacts not found: ${e.getMessage()}"
    }

    try {
        dockerCompose.downCmd(
            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
            ignoreErrors: true
        )
    } catch (e) {
        echo "dockerCompose downCmd failed: ${e.getMessage()}"
    }

    // clean root owned resources from docker volumes, just in case
    sh "sudo rm -rf ./coverage || true"
    sh "sudo rm -rf ./cypress || true"
    sh "sudo rm -rf ./report || true"
}

def archiveValidationArtifacts() {
     try {
            archiveArtifacts artifacts: 'translation-validation-result.json', onlyIfSuccessful: false
        } catch (e) {
            echo "Artifacts not found: ${e.getMessage()}"
        }
}
