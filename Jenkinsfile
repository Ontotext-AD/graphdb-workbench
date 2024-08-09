pipeline {
    agent {
        docker {
             image 'node:18'
             label env.AGENT
        }
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
                }
            }
        }

        stage('Install') {
            steps {
                sh 'npm run install --verbose'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Pre-build validations') {
            steps {
                sh 'npm run validate'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Cypress Test') {
            steps {
                sh 'npm run cy:run'
            }
        }

        stage('Sonar') {
            steps {
                sh 'npm run sonar'
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
