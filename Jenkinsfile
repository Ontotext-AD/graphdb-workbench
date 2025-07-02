@Library('ontotext-platform@update-docker-compose') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-22'
    }

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose-testcontainers.yaml"
        SONAR_ENVIRONMENT = "SonarCloud"
        TOTAL_MACHINES = '1'
        THREADS_PER_MACHINE = '5'
        COMPOSE_PROJECT_NAME = "workbench_build_${env.BUILD_NUMBER}"
    }

    stages {
        stage('Install') {
            steps {
                script {
                    sh 'npm run install:ci'
                }
            }
        }

//         stage('Lint & Validate') {
//             steps {
//                 sh 'npm run lint'
//                 sh 'npm run validate'
//             }
//              post {
//                 failure {
//                     archiveArtifacts allowEmptyArchive: true, artifacts: 'translation-report.json'
//                 }
//             }
//         }


        stage('Build & Stash') {
            steps {
                sh 'npm run build'
//                 echo "Stashing workspace..."
//                 stash includes: '**', name: 'workspace'
            }
        }

//         stage('Sonar') {
//             steps {
//                 withSonarQubeEnv(SONAR_ENVIRONMENT) {
//                     script {
//                         try {
//                             if (scmUtil.isMaster()) {
//                                 sh "node sonar-project.js --branch='${scmUtil.getCurrentBranch()}'"
//                             } else {
//                                 sh "node sonar-project.js --branch='${scmUtil.getSourceBranch()}' --target-branch='${scmUtil.getTargetBranch()}' --pull-request-id='${scmUtil.getMergeRequestId()}'"
//                             }
//                         } catch (e) {
//                             echo "Sonar analysis failed. Error: ${e.getMessage()}"
//                         }
//                     }
//                 }
//             }
//         }
//
//         stage('Test') {
//             steps {
//                 script {
//                     sh 'npm run test'
//                 }
//             }
//         }
//
//         stage('Shared-components Cypress Test') {
//             steps {
//                 dir('packages/shared-components') {
//                     script {
//                         dockerCompose.buildCmd(composeFile: 'docker-compose.yaml', options: ['--force-rm'])
//
//                         def caughtError = false
//                         catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
//                             try {
//                                 dockerCompose.upCmd(
//                                     environment: getUserUidGidPair(),
//                                     composeFile: 'docker-compose.yaml',
//                                     options: ['--abort-on-container-exit', '--exit-code-from cypress']
//                                 )
//                             } catch (e) {
//                                 caughtError = true
//                             }
//                         }
//
//                         if (caughtError) {
//                             echo "Tests failed — archiving Cypress video artifacts."
//                             archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*.png, cypress/videos/**/*.mp4'
//                             error("Cypress tests failed, job failed.")
//                         }
//
//                         echo "Tests passed — skipping video artifacts."
//                         dockerCompose.downCmd(
//                             composeFile: 'docker-compose.yaml',
//                             options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
//                             ignoreErrors: true
//                         )
//                     }
//                 }
//             }
//         }

        // TODO - PERFORMANCE OPTIMIZATION
        // Currently, the Cypress image is rebuilt on each parallel agent
        // because access to a shared Docker registry (ECR) is not available.
        // When ECR access is granted, this pipeline should be
        // refactored to use the 'build once, pull many' model.
        stage('Build Cypress Image') {
            steps {
                script {
                    echo "Building the main test Docker image once..."
                    dockerCompose.buildCmd(
                        composeFile: env.DOCKER_COMPOSE_FILE,
                        options: ["--force-rm"]
                    )
                }
            }
        }

        stage('Run Workbench Cypress Tests in Parallel') {
            when {
                expression { !scmUtil.isMaster() }
            }
            steps {
                script {
                    def totalMachines = env.TOTAL_MACHINES.toInteger()
                    def threadsPerMachine = env.THREADS_PER_MACHINE.toInteger()
                    def totalSplits = totalMachines * threadsPerMachine

                    echo "Starting a total of ${totalSplits} test splits across ${totalMachines} machines (${threadsPerMachine} threads per machine)."

                    def machineStages = [:]
                    for (int i = 0; i < totalMachines; i++) {
                        def machineIndex = i
                         if (machineIndex == 0) {
                            machineStages["Machine 1 (Master)"] = {
                                try {
                                    echo "Running threads on master agent ${env.NODE_NAME}"
                                    runThreadsOnCurrentAgent(machineIndex, threadsPerMachine, totalSplits)
                                } finally {
                                    echo "Wiping remote agent workspace: ${env.NODE_NAME}"
                                    forceCleanCypress()
                                }
                            }
                        } else {
                            machineStages["Machine ${machineIndex + 1}"] = {
                                node('aws-large') {
                                    try {
                                        cleanWs()
                                        echo "Running threads on new agent ${env.NODE_NAME}"
                                        unstash 'workspace'
                                        runThreadsOnCurrentAgent(machineIndex, threadsPerMachine, totalSplits)
                                    } finally {
                                        echo "Stashing results from ${env.NODE_NAME}"
                                        stash name: "results_from_machine_${machineIndex}", includes: 'cypress/**', allowEmpty: true
                                        echo "Wiping remote agent workspace: ${env.NODE_NAME}"
                                        forceCleanCypress()
                                    }
                                }
                            }
                        }
                    }
                    parallel machineStages
                    echo "Aggregating results from all remote machines..."
                    for (int i = 1; i < totalMachines; i++) {
                        unstash name: "results_from_machine_${i}"
                    }
                }
            }
//             post {
//                 always {
//                     sh 'echo "[DEBUG] Listing contents of cypress/results:"'
//                     sh 'ls -la cypress/results || echo "Directory not found"'
//
//                     sh 'echo "[DEBUG] Recursively listing all result files:"'
//                     sh 'find cypress/results || echo "Nothing found in results"'
//
//                     echo 'Tests finished. Merging and printing summary report...'
//                     sh(script: 'node scripts/ci/print-summary.js cypress/results/', returnStatus: true)
//                 }
//             }
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

def runThreadsOnCurrentAgent(int machineIndex, int threadsPerMachine, int totalSplits) {
    def threadStages = [:]
    for (int i = 0; i < threadsPerMachine; i++) {
        def globalSplitIndex = (machineIndex * threadsPerMachine) + i

        threadStages["Thread-${globalSplitIndex + 1}"] = {
            runCypressThread(globalSplitIndex, totalSplits)
        }
    }
    parallel threadStages
}

def runCypressThread(int splitIndex, int totalSplits) {
    def threadProjectName = "${env.COMPOSE_PROJECT_NAME}_split_${splitIndex}"
    def baseDir= "e2e-tests/cypress/results/split-${splitIndex}"
    try {
        withKsm(application: [[
            credentialsId: 'ksm-jenkins',
            secrets: [
                [destination: 'file', filePath: 'graphdb.license', notation: 'keeper://AByA4tIDmeN7RmqnQYGY0A/file/graphdb.license']
            ]
        ]]) {
            sh 'cp graphdb.license ./e2e-tests/fixtures/'

            def caughtError = false
            def result = catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                  dockerCompose.upCmd(
                      environment: getUserUidGidPair() + [
                           "SPLIT": totalSplits,
                           "SPLIT_INDEX": splitIndex
                      ],
                      composeFile: env.DOCKER_COMPOSE_FILE,
                      options: [
                          "--abort-on-container-exit",
                          "--exit-code-from", "cypress"
                      ],
                      globalOptions: ["-p", threadProjectName]
                  )
                  return 'SUCCESS'
              }

              if (result != 'SUCCESS') {
                  caughtError = true
              }

              sh "mkdir -p ${baseDir}/results"
              sh "cp -r cypress/results/* ${baseDir}/results/ || true"

              if (caughtError) {
                  echo "Tests failed on Split ${splitIndex} — archiving artifacts."
                  archiveArtifacts allowEmptyArchive: true, artifacts: "cypress/logs/**/*.txt, cypress/screenshots/${splitIndex}/**/*.png, cypress/videos/${splitIndex}/**/*.mp4"
            }
        }
    } finally {
//         echo "Cleaning up Cypress artifacts on agent ${env.NODE_NAME}"
//         forceCleanCypress()
        echo "Cleaning up Docker resources for Split ${splitIndex} on ${env.NODE_NAME}"
        dockerCompose.downCmd(
            composeFile: env.DOCKER_COMPOSE_FILE,
            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
            globalOptions: ["-p", threadProjectName],
            ignoreErrors: true
        )
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

def forceCleanCypress() {
    echo "Force cleaning entire workspace as root on ${env.NODE_NAME}..."
    try {
        docker.image('alpine:latest').inside('--user root') {
            sh 'rm -rf ./cypress || true'
        }
        echo "Workspace content on ${env.NODE_NAME} deleted successfully."
    } catch (err) {
        echo "Force workspace cleanup failed on ${env.NODE_NAME}: ${err.getMessage()}"
    }
}
