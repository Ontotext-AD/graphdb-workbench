pipeline {
    agent {
        label env.AGENT
    }

    environment {
        REPO_URL = 'https://github.com/Ontotext-AD/graphdb-workbench.git'
    }

    tools {
        nodejs 'nodejs-20.11.1'
    }

    stages {
        stage('Build Info') {
            steps {
                script {
                    echo "Agent: ${env.AGENT}"
                    echo "Building branch: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Install') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'docker-compose run --rm npm run install:ci'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'docker-compose run --rm npm run build'
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'docker-compose run --rm npm run lint'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'docker-compose run --rm npm run test'
                    }
                }
            }
        }

        stage('Cypress Test') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        // Fix user rights
                        sh 'sudo chown -R $(id -u):$(id -g) .'
                        sh 'npm run cy:run'
                    }
                }
            }
        }

        stage('Sonar') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        sh 'sudo chown -R $(id -u):$(id -g) .'
                        withSonarQubeEnv('SonarCloud') {
                            withEnv(["BRANCH_NAME=${env.BRANCH_NAME}"]) {
                                sh 'npm run sonar'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            wrap([$class: 'BuildUser']) {
                emailext(
                    to: env.BUILD_USER_EMAIL,
                    from: "Jenkins <hudson@ontotext.com>",
                    subject: '''[Jenkins] $PROJECT_NAME - Build #$BUILD_NUMBER - $BUILD_STATUS!''',
                    mimeType: 'text/html',
                    body: '''${SCRIPT, template="groovy-html.template"}'''
                )
            }
        }
    }
}
