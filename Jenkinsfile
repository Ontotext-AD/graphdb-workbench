@Library('ontotext-platform@v0.1.49') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose-test.yaml"
        SONAR_ENVIRONMENT = "SonarCloud"
    }

    stages {
        stage('Install') {
            agent {
                docker {
                    image 'node:20-alpine'
                    label 'aws-large'
                    reuseNode true
                }
            }
            steps {
                script {
                    sh 'npm run install:ci'
                }
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'node:20-alpine'
                    label 'aws-large'
                    reuseNode true
                }
            }
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    sh 'npm run lint'
                }
            }
        }

        stage('Validate') {
            steps {
                script {
                    sh 'npm run validate'
                }
            }
             post {
                failure {
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'translation-report.json'
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
                            echo "Sonar analysis failed. Error: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    sh 'npm run test'
                }
            }
        }

        stage('Shared-components Cypress Test') {
            steps {
                dir('packages/shared-components') {
                    script {
                        dockerCompose.buildCmd(composeFile: 'docker-compose.yaml', options: ['--force-rm']);
                        try {
                            dockerCompose.upCmd(environment: getUserUidGidPair(), composeFile: 'docker-compose.yaml', options: ['--abort-on-container-exit', '--exit-code-from cypress']);
                        } finally {
                            try {
                                if (currentBuild.result == null || currentBuild.result == 'SUCCESS') {
                                    echo "Tests passed — skipping video artifacts.";
                                } else {
                                    echo "Tests failed — archiving Cypress video artifacts.";
                                    archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*.png, cypress/videos/**/*.mp4';
                                }
                            } catch (e) {
                                echo "Artifacts not found or failed to archive: ${e.getMessage()}";
                            }

                            dockerCompose.downCmd(
                                composeFile: 'docker-compose.yaml',
                                options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                                ignoreErrors: true
                            );
                        }
                    }
                }
            }
        }

        stage('Workbench Cypress Test') {
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
                            sh 'cp graphdb.license ./e2e-tests/fixtures/'
                             archiveArtifacts allowEmptyArchive: true, artifacts: 'graphdb.license'

                            sh "ls -lh ./e2e-tests/fixtures/"
                            dockerCompose.buildCmd(composeFile: env.DOCKER_COMPOSE_FILE, options: ["--force-rm"])
                            try {
                                dockerCompose.upCmd(environment: getUserUidGidPair(), composeFile: env.DOCKER_COMPOSE_FILE, options: ["--abort-on-container-exit", "--exit-code-from cypress"])
                            } finally {
                                dockerCompose.downCmd(composeFile: env.DOCKER_COMPOSE_FILE,
                                                      options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                                                      ignoreErrors: true)
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                workspaceCleanup()
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }
    }
}

def workspaceCleanup() {
    configFileProvider([configFile(fileId: 'cleanup-script', variable: 'CLEANUP_SCRIPT')]) {
        def scriptContent = readFile(env.CLEANUP_SCRIPT)
        evaluate(scriptContent)
    }
}

def getUserUidGidPair() {
    def uid = sh(script: 'id -u', returnStdout: true).trim()
    def gid = sh(script: 'id -g', returnStdout: true).trim()
    return [UID: uid, GID: gid]
}
