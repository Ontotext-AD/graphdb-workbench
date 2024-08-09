pipeline {
    agent {
        label env.AGENT
    }

    environment {
        REPO_URL = 'https://github.com/Ontotext-AD/graphdb-workbench.git'
    }

    stages {

        stage('Build Info') {
            steps {
                script {
                    echo "Agent: ${env.AGENT}"
                    echo "Building branch: ${env.BRANCH_NAME}"
                    sh 'docker-compose run --rm node --version'
                }
            }
        }

        stage('Install') {
            steps {
                sh 'docker-compose run --rm npm run install'
            }
        }

        stage('Lint') {
            steps {
                sh 'docker-compose run --rm npm run lint'
            }
        }

        stage('Pre-build validations') {
            steps {
                sh 'docker-compose run --rm npm run validate'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose run --rm npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'docker-compose run --rm npm run test'
            }
        }

        stage('Cypress Test') {
            steps {
                sh 'docker-compose run --rm npm run cy:run'
            }
        }

        stage('Sonar') {
            steps {
                sh 'docker-compose run --rm npm run sonar'
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
