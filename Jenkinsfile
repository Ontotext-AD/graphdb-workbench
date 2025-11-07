@Library('ontotext-platform@v0.1.51') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-22'
    }

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose-test.yaml"
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

        stage('Security Cypress Test') {
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
                        sh 'pwd'
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
                                    environment: getUserUidGidPair() + [CYPRESS_script: 'cy:run-security'],
                                    composeFile: env.DOCKER_COMPOSE_FILE,
                                    options: ["--abort-on-container-exit", "--exit-code-from cypress"]
                                )
                            } catch (e) {
                                caughtError = true
                            }
                        }

                        if (caughtError) {
                            echo "Security tests failed — archiving Cypress artifacts."
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'e2e-tests/report/screenshots/**/*.png, e2e-tests/report/videos/**/*.mp4, e2e-tests/cypress/logs/*.log, e2e-tests/logs/cypress-logs/**/*.txt'
                            error("Security Cypress tests failed, job failed.")
                        }

                        echo "Security tests passed — skipping video artifacts."
                        dockerCompose.downCmd(
                            composeFile: env.DOCKER_COMPOSE_FILE,
                            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                            ignoreErrors: true
                        )
                    }
                }
            }
        }

        stage('Shared-components Cypress Test') {
            steps {
                dir('packages/shared-components') {
                    script {
                        dockerCompose.buildCmd(composeFile: 'docker-compose.yaml', options: ['--force-rm'])

                        def caughtError = false
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            try {
                                dockerCompose.upCmd(
                                    environment: getUserUidGidPair(),
                                    composeFile: 'docker-compose.yaml',
                                    options: ['--abort-on-container-exit', '--exit-code-from cypress']
                                )
                            } catch (e) {
                                caughtError = true
                            }
                        }

                        if (caughtError) {
                            echo "Tests failed — archiving Cypress video artifacts."
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*.png, cypress/videos/**/*.mp4'
                            error("Cypress tests failed, job failed.")
                        }

                        echo "Tests passed — skipping video artifacts."
                        dockerCompose.downCmd(
                            composeFile: 'docker-compose.yaml',
                            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                            ignoreErrors: true
                        )
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
