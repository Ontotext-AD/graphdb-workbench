pipeline {

  agent {
    label 'graphdb-jenkins-node'
  }

  environment {
    CI = "true"
  }

  stages {
    stage('Install') {
      steps {
        sh "npm install"
      }
    }
  }
}
