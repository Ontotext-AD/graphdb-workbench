@Library('ontotext-platform@v0.1.49') _

pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    stages {
        stage('Install, Lint, Validate, Build') {
            steps {
                script {
                    npm.install(scripts: ['lint', 'validate', 'build', 'test'])
                }
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
                sendMail(env.BUILD_USER_EMAIL)
            }
        }
    }
}
