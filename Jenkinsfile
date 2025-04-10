@Library('ontotext-platform@v0.1.49') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    environment {
        dockerComposeFile = "docker-compose-test.yaml"
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
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'npm run install:ci'
                    }
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
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'npm run test'
                    }
                }
            }
        }

        stage('Shared-components Cypress Test') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        try {
                            sh 'npm run cy:run'
                        } finally {
                            try {
                                archiveArtifacts allowEmptyArchive: true, artifacts: 'report/screenshots/**/*.png, report/videos/**/*.mp4, cypress/logs/*.log, report/console/**/*.txt'
                                sh 'npm run cy:down'
                            } catch (e) {
                                echo "Artifacts not found: ${e.getMessage()}"
                            }
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
                            dockerCompose.buildCmd(composeFile: env.dockerComposeFile, options: ["--force-rm"])
                            try {
                                dockerCompose.upCmd(composeFile: env.dockerComposeFile, options: ["--abort-on-container-exit", "--exit-code-from cypress"])
                            } finally {
                                dockerCompose.downCmd(composeFile: env.dockerComposeFile,
                                                      options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                                                      ignoreErrors: true)
                            }
                        }
                    }
                }
            }
        }

        stage('Sonar') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        try {
                            withSonarQubeEnv('SonarCloud') {
                                withEnv(["BRANCH_NAME=${scmUtil.getCurrentBranch()}"]) {
                                    sh 'npm run sonar'
                                }
                            }
                        } catch (e) {
                            echo "Sonar analysis failed, but continuing the pipeline. Error: ${e.getMessage()}"
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }
    }
}
