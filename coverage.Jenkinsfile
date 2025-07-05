@Library('ontotext-platform@v0.1.49') _

pipeline {
    agent {
        label 'aws-large'
    }

    tools {
         nodejs 'nodejs-22'
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose-coverage.yaml'
    }

    parameters {
        gitParameter name: 'GIT_BRANCH',
            description: 'The Git branch to test',
            branchFilter: 'origin/(.*)',
            defaultValue: 'master',
            selectedValue: 'DEFAULT',
            type: 'PT_BRANCH',
            listSize: '0',
            quickFilterEnabled: true
    }

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Install And Stash') {
            steps {
                script {
                    git_cmd.checkout(branch: params.GIT_BRANCH)
                    sh 'npm run install:ci'
                    stash name: 'workspace', includes: '**/*', useDefaultExcludes: false
                }
            }
        }

        stage('Unit Test Coverage') {
            steps {
                script {
                    restoreWorkspace()
                    sh 'npm run test:coverage'
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'packages/api/coverage/**, packages/root-config/coverage/**, packages/shared-components/coverage/**'
                }
            }
        }

        // =====================================================================================
        // Code Coverage Instrumentation Workaround
        //
        // The following three stages ('Instrument', 'Build', 'Restore source code') are a
        // necessary workaround to generate accurate code coverage reports for our single-spa
        // application.
        //
        // **Problem:** The standard "in-memory" instrumentation during the Webpack build causes
        // issues for `nyc` (the reporting tool). `nyc` struggles to map the coverage data
        // from the final, single bundled JS file back to the original source files.
        //
        // **Solution:** We use a more explicit, physical approach:
        //   1. **Instrument:** Modify the source files on disk before the build.
        //   2. **Build:** Create the distributable (`dist/`) from the pre-instrumented code.
        //   3. **Restore:** Reset the workspace to its original state, leaving clean source
        //      code for `nyc` to use when generating the final HTML report.
        //
        // This ensures that `nyc` can always find a matching source file for the data
        // collected by Cypress, guaranteeing a correct report.
        // =====================================================================================
        stage('Instrument') {
            steps {
                script {
                    restoreWorkspace()
                    sh 'npm run instrument:legacy-workbench'
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
        stage ('Restore source code') {
            steps {
                script {
                    echo "Stashing dist/ into Jenkins..."
                    stash name: 'dist-artifacts', includes: 'dist/**', allowEmpty: true

                    echo "Hard reset of ${params.GIT_BRANCH}..."
                    sh "git reset --hard ${params.GIT_BRANCH}"

                    echo "Unstash dist/ onto workspace..."
                    unstash 'dist-artifacts'
                }
            }
        }

        stage('Workbench Cypress Test With Coverage') {
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
                        sh 'cp graphdb.license ./e2e-tests/fixtures/'
                        sh "ls -lh ./e2e-tests/fixtures/"
                        dockerCompose.buildCmd(
                            composeFile: env.DOCKER_COMPOSE_FILE,
                            options: ["--force-rm"]
                        )

                        def caughtError = false
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            dockerCompose.upCmd(
                                composeFile: env.DOCKER_COMPOSE_FILE,
                                options: ["--abort-on-container-exit", "--exit-code-from cypress"]
                            )
                        }

                        echo "Tests passed — archiving coverage artifacts."
                        archiveArtifacts allowEmptyArchive: true, artifacts: 'e2e-tests/coverage/**'
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

    post {
        success {
            script {
                workspaceCleanup()
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }

            script {
                workspaceCleanup()
            }
        }
    }
}

def workspaceCleanup() {
    configFileProvider([configFile(fileId: 'cleanup-script', variable: 'CLEANUP_SCRIPT')]) {
        def scriptContent = readFile(env.CLEANUP_SCRIPT)
        evaluate(scriptContent)
    }
}

def restoreWorkspace() {
    cleanWs()
    unstash 'workspace'
}
