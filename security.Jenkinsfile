@Library('ontotext-platform@v0.1.51') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-22'
    }

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose-security-test.yaml"
        SONAR_ENVIRONMENT = "SonarCloud"
        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    }

    stages {
        stage('Install') {
            steps {
                script {
                    sh 'echo "Registry from env: $NPM_CONFIG_REGISTRY"'
                    sh 'npm config get registry'
                    sh 'npm run install:ci'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Workbench Cypress Test') {
            steps {
                script {
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
                        dockerCompose.buildCmd(
                            composeFile: env.DOCKER_COMPOSE_FILE,
                            options: ["--force-rm"]
                        )

                        def caughtError = false
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            try {
                                dockerCompose.upCmd(
                                    environment: getUserUidGidPair(),
                                    composeFile: env.DOCKER_COMPOSE_FILE,
                                    options: ["--abort-on-container-exit", "--exit-code-from cypress"]
                                )
                            } catch (e) {
                                caughtError = true
                            }
                        }

                        if (caughtError) {
                            echo "Tests failed — archiving Cypress video artifacts."
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'e2e-tests/report/screenshots/**/*.png, e2e-tests/report/videos/**/*.mp4, e2e-tests/cypress/logs/*.log'
                            error("Cypress tests failed, job failed.")
                        }

                        echo "Tests passed — skipping video artifacts."
                        dockerCompose.downCmd(
                            composeFile: env.DOCKER_COMPOSE_FILE,
                            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                            ignoreErrors: true
                        )
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                notifySlack()
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

def notifySlack() {
    configFileProvider([configFile(fileId: 'notify-slack-script', variable: 'NOTIFY_SLACK_SCRIPT')]) {
        def scriptContent = readFile(env.NOTIFY_SLACK_SCRIPT)
        evaluate(scriptContent)
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
