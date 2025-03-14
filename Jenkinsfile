@Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
pipeline {
    agent any
    environment {
        CI = "true"
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
        // Tells NPM and co. not to use color output (looks like garbage in Jenkins)
        NO_COLOR = "1"
        SONAR_ENVIRONMENT = "SonarCloud"
        LEGACY_JENKINS = "https://jenkins.ontotext.com"
        NEW_JENKINS = "https://new-jenkins.ontotext.com"
        LEGACY_AGENT = 'graphdb-jenkins-node'
        NEW_AGENT = 'aws-large'
    }

    stages {
        stage('Trigger sub-pipelines') {

            agent {
               label env.JENKINS_URL.contains(env.LEGACY_JENKINS) ? env.LEGACY_AGENT : env.NEW_AGENT
            }

            tools {
                nodejs env.JENKINS_URL.contains(env.LEGACY_JENKINS) ? 'nodejs-20.11.1' : 'nodejs-18.9.0'
            }

            steps {
                script {
                    if (env.JENKINS_URL.contains(env.LEGACY_JENKINS)) {
                        def ciPipeline = load '.jenkins/legacy-ci.jenkinsfile'
                        ciPipeline.runStages()
                    } else if (env.JENKINS_URL.contains(env.NEW_JENKINS)) {
                        def ciPipeline = load '.jenkins/ci.jenkinsfile'
                        ciPipeline.runStages()
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.JENKINS_URL.contains(env.LEGACY_JENKINS)) {
                    cleanup()
                } else if (env.JENKINS_URL.contains(env.NEW_JENKINS)) {
                    node(env.NEW_AGENT) {
                        cleanup()
                    }
                }
            }
        }

        failure {
            script {
                if (env.JENKINS_URL.contains(env.LEGACY_JENKINS)) {
                    archiveArtifacts()
                } else if (env.JENKINS_URL.contains(env.NEW_JENKINS)) {
                    node(env.NEW_AGENT) {
                        archiveArtifacts()
                    }
                }
            }
        }
    }
}

def cleanup() {
    // upload failed tests report and artifacts
    junit allowEmptyResults: true, testResults: 'cypress/results/**/*.xml'
    archiveArtifacts allowEmptyArchive: true, artifacts: 'report/screenshots/**/*.png, report/videos/**/*.mp4, cypress/logs/*.log'

    script {
        dockerCompose.downCmd(removeVolumes: true, removeOrphans: true, removeImages: 'local', ignoreErrors: true)
    }
    // clean root owned resources from docker volumes, just in case
    sh "sudo rm -rf ./coverage"
    sh "sudo rm -rf ./cypress"
    sh "sudo rm -rf ./report"
}


def archiveArtifacts() {
    archiveArtifacts artifacts: 'translation-validation-result.json', onlyIfSuccessful: false
}
