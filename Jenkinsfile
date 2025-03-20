// @Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
// pipeline {
//     environment {
//         CI = "true"
//         // Needed for our version of webpack + newer nodejs
//         NODE_OPTIONS = "--openssl-legacy-provider"
//         // Tells NPM and co. not to use color output (looks like garbage in Jenkins)
//         NO_COLOR = "1"
//         SONAR_ENVIRONMENT = "SonarCloud"
//         LEGACY_JENKINS = "https://jenkins.ontotext.com"
//         NEW_JENKINS = "https://new-jenkins.ontotext.com"
//         LEGACY_AGENT = 'graphdb-jenkins-node'
//         AGENT = 'aws-large'
//     }
//
//     // TODO fix when migration is complete
//     agent {
//         label 'aws-large'
//     }
//
//     tools {
//         nodejs 'nodejs-18.9.0'
//     }
//
//     stages {
//         stage('Install') {
//             steps {
//                 sh "npm install"
//             }
//         }
//
//         stage('Validate translations') {
//             steps {
//                 sh 'node scripts/validate-translations.js || exit 1'
//             }
//         }
//
//         stage('Build') {
//             steps {
//                 sh "npm run build"
//             }
//         }
//
//         stage('Sonar') {
//               steps {
//                     withSonarQubeEnv(SONAR_ENVIRONMENT) {
//                         script {
//                             if (scmUtil.isMaster()) {
//                                 sh "node sonar-project.js --branch='${scmUtil.getCurrentBranch()}'"
//                             } else {
//                                 sh "node sonar-project.js --branch='${scmUtil.getSourceBranch()}' --target-branch='${scmUtil.getTargetBranch()}' --pull-request-id='${scmUtil.getMergeRequestId()}'"
//                             }
//                         }
//                     }
//               }
//         }
//
//         stage('Acceptance') {
//             steps {
//                 script {
//                     if (!scmUtil.isMaster()) {
//                         withKsm(application: [[
//                             credentialsId: 'ksm-jenkins',
//                             secrets: [
//                                 [
//                                     destination: 'file',
//                                     filePath: 'graphdb.license',
//                                     notation: 'keeper://zn9mpFS1tZ0dNcqmsNhsLg/file/graphdb-b64.license'
//                                 ]
//                             ]
//                         ]]) {
//                             sh 'cp graphdb.license ./test-cypress/fixtures/'
//                         }
//                         sh "ls ./test-cypress/fixtures/"
//                         script {
//                             withEnv(["DOCKER_BUILDKIT=0", "COMPOSE_DOCKER_CLI_BUILD=0"]) {
//                                 dockerCompose.buildCmd(options: ["--force-rm", "--no-cache", "--parallel"])
//                                 dockerCompose.upCmd(options: ["--abort-on-container-exit", "--exit-code-from cypress-tests"])
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//
//     post {
//         always {
//             script {
//                 node(env.AGENT) {
//                     cleanup()
//                 }
//             }
//         }
//
//         failure {
//             script {
//                 node(env.AGENT) {
//                     archiveArtifacts()
//                 }
//             }
//         }
//     }
// }
//
// def cleanup() {
//     // upload failed tests report and artifacts
//     junit allowEmptyResults: true, testResults: 'cypress/results/**/*.xml'
//     archiveArtifacts allowEmptyArchive: true, artifacts: 'report/screenshots/**/*.png, report/videos/**/*.mp4, cypress/logs/*.log'
//
//     script {
//         dockerCompose.downCmd(removeVolumes: true, removeOrphans: true, removeImages: 'local', ignoreErrors: true)
//     }
//     // clean root owned resources from docker volumes, just in case
//     sh "sudo rm -rf ./coverage"
//     sh "sudo rm -rf ./cypress"
//     sh "sudo rm -rf ./report"
// }
//
//
// def archiveArtifacts() {
//     archiveArtifacts artifacts: 'translation-validation-result.json', onlyIfSuccessful: false
// }
@Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    environment {
        CI = "true"
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
        // Tells NPM and co. not to use color output (looks like garbage in Jenkins)
        NO_COLOR = "1"
        SONAR_ENVIRONMENT = "SonarCloud"
    }

    stages {
        stage('Install, Validate translations, Build') {
            steps {
                script {
                    npm.install(scripts: ['validate-translations', 'build'])
                }
            }
        }


//         stage('Sonar') {
//             steps {
//                 withSonarQubeEnv(SONAR_ENVIRONMENT) {
//                     script {
//                         if (scmUtil.isMaster()) {
//                             sh "node sonar-project.js --branch='${scmUtil.getCurrentBranch()}'"
//                         } else {
//                             sh "node sonar-project.js --branch='${scmUtil.getSourceBranch()}' --target-branch='${scmUtil.getTargetBranch()}' --pull-request-id='${scmUtil.getMergeRequestId()}'"
//                         }
//                     }
//                 }
//             }
//         }
        stage('Acceptance') {
            steps {
                script {
                    if (!scmUtil.isMaster()) {
                        withKsm(application: [[
                            credentialsId: 'ksm-jenkins',
                            secrets: [
                                [
                                    destination: 'file',
                                    filePath: 'graphdb.license',
                                    notation: 'keeper://zn9mpFS1tZ0dNcqmsNhsLg/file/graphdb-b64.license'
                                ]
                            ]
                        ]]) {
                            sh 'cp graphdb.license ./test-cypress/fixtures/'
                        }
                        sh "ls ./test-cypress/fixtures/"
                        dockerCompose.buildCmd(options: ["--force-rm", "--parallel"])
                        dockerCompose.upCmd(options: ["--abort-on-container-exit", "--exit-code-from cypress-tests"])
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                node(env.NEW_AGENT) {
                    cleanup()
                }
            }
        }

        failure {
            script {
                node(env.NEW_AGENT) {
                    archiveArtifacts()
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
