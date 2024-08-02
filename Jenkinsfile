pipeline {
    agent {
        docker {
             image 'node:18'
             args '-u root:root'
             label env.AGENT
        }
    }

    environment {
        REPO_URL = 'https://github.com/Ontotext-AD/graphdb-workbench.git'
    }

    stages {
        stage('Build') {
            steps {
                sh 'node --version'
            }
        }
    }
}
