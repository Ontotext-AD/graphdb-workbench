@Library('ontotext-platform@v0.1.51') _
pipeline {
    agent {
        label 'aws-large'
    }

    tools {
        nodejs 'nodejs-22'
    }

    options {
        // A new push to the same branch or PR supersedes the running build, so abort it instead of queueing.
        disableConcurrentBuilds(abortPrevious: true)
    }

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose-test.yaml"
        // Parallel Workbench e2e shards, each with its own GraphDB, workbench and Cypress.
        E2E_SHARDS = "3"
        SONAR_ENVIRONMENT = "SonarCloud"
        NPM_CONFIG_REGISTRY = 'https://registry.npmjs.org/'
    }

    stages {
        stage('Install') {
            steps {
                script {
                    sh 'echo "Registry from env: $NPM_CONFIG_REGISTRY"'
                    sh 'npm config get registry'
                    sh 'npm run install:ci'
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

        // Outside the parallel block: in parallel, its components failed to render on CI.
        stage('Shared-components Cypress Test') {
            steps {
                dir('packages/shared-components') {
                    script {
                        dockerCompose.buildCmd(composeFile: 'docker-compose.yaml', options: ['--force-rm'])

                        def caughtError = false
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            try {
                                dockerCompose.upCmd(
                                    environment: getUserUidGidPair(),
                                    composeFile: 'docker-compose.yaml',
                                    options: ['--abort-on-container-exit', '--exit-code-from cypress']
                                )
                            } catch (e) {
                                caughtError = true
                            }
                        }

                        if (caughtError) {
                            echo "Tests failed — archiving Cypress video artifacts."
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*.png, cypress/videos/**/*.mp4'
                            error("Cypress tests failed, job failed.")
                        }

                        echo "Tests passed — skipping video artifacts."
                        dockerCompose.downCmd(
                            composeFile: 'docker-compose.yaml',
                            options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                            ignoreErrors: true
                        )
                    }
                }
            }
        }

        // Only Build output is needed by these, so they run side by side.
        stage('Checks') {
            parallel {
                stage('Lint') {
                    steps {
                        script {
                            sh 'npm run lint'
                        }
                    }
                }

                stage('Validate') {
                    steps {
                        script {
                            sh 'npm run validate'
                        }
                    }
                    post {
                        failure {
                            archiveArtifacts allowEmptyArchive: true, artifacts: 'translation-report.json'
                        }
                    }
                }

                stage('Sonar') {
                    steps {
                        withSonarQubeEnv(SONAR_ENVIRONMENT) {
                            script {
                                try {
                                    if (scmUtil.isMaster()) {
                                        sh "node sonar-project.js --branch='${scmUtil.getCurrentBranch()}'"
                                    } else {
                                        // The PR checkout has no target branch ref, which Sonar needs to detect the changed lines.
                                        sh "git fetch --no-tags origin '+refs/heads/${scmUtil.getTargetBranch()}:refs/remotes/origin/${scmUtil.getTargetBranch()}'"
                                        sh "node sonar-project.js --branch='${scmUtil.getSourceBranch()}' --target-branch='${scmUtil.getTargetBranch()}' --pull-request-id='${scmUtil.getMergeRequestId()}'"
                                    }
                                } catch (e) {
                                    echo "Sonar analysis failed. Error: ${e.getMessage()}"
                                }
                            }
                        }
                    }
                }

                stage('Test') {
                    steps {
                        script {
                            sh 'npm run test'
                        }
                    }
                }

                stage('Workbench e2e setup') {
                    steps {
                        script {
                            if (!scmUtil.isMaster()) {
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
                                    archiveArtifacts allowEmptyArchive: true, artifacts: 'graphdb.license'

                                    sh "ls -lh ./e2e-tests/fixtures/"

                                    // Round-robin over the sorted spec list. Paths are relative to the Cypress container's /e2e.
                                    def specs = sh(
                                        script: "cd e2e-tests && find e2e-legacy -type f \\( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \\) | sort",
                                        returnStdout: true
                                    ).trim().split('\n')
                                    def shardCount = env.E2E_SHARDS as Integer
                                    def failedShards = []
                                    def shards = [:]
                                    for (int i = 0; i < shardCount; i++) {
                                        def shard = i
                                        def shardSpecs = []
                                        for (int j = shard; j < specs.size(); j += shardCount) {
                                            shardSpecs << specs[j]
                                        }
                                        def specList = shardSpecs.join(',')
                                        def stageName = "Workbench e2e ${shard + 1}/${shardCount}"
                                        shards[stageName] = {
                                            // A stage per shard, so each shard shows its own status and time.
                                            stage(stageName) {
                                                if (!runCypressShard(shard, specList)) {
                                                    failedShards << shard
                                                    // Thrown, not caught, so Stage View shows the shard as failed.
                                                    error("${stageName} failed")
                                                }
                                            }
                                        }
                                    }
                                    // Waits for all shards and rethrows if one failed. Failed shards are handled below;
                                    // anything else, such as an abort, is rethrown.
                                    try {
                                        parallel shards
                                    } catch (e) {
                                        if (isAborted(e) || !failedShards) {
                                            throw e
                                        }
                                    }

                                    stage('Workbench e2e report') {
                                        // One result table and one retry summary for all shards, as in an unsharded run.
                                        // Made before the rerun, which adds its own results, and printed last to end the log.
                                        def summary = sh(script: 'cd e2e-tests && node scripts/print-summary.js || true', returnStdout: true)

                                        if (failedShards) {
                                            rerunFailedSpecsWithVideo(failedShards)
                                            echo "Tests failed — archiving Cypress artifacts and GraphDB diagnostics."
                                            archiveArtifacts allowEmptyArchive: true, artifacts: 'e2e-tests/report/screenshots/**/*.png, e2e-tests/report/videos/**/*.mp4, e2e-tests/logs/**, graphdb-diagnostics/**'
                                            echo summary
                                            error("Cypress tests failed, job failed.")
                                        }

                                        echo "Tests passed — skipping video artifacts."
                                        echo summary
                                    }
                                }
                            }
                        }
                    }
                }
            }
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

// Runs one shard of the Workbench e2e specs on its own compose project (GraphDB, workbench, Cypress),
// so shards never share server state. Returns false if the tests failed; their GraphDB diagnostics are
// then collected. The containers are always removed, also on an abort, which is rethrown.
def runCypressShard(int shard, String specs) {
    def passed = true
    withEnv(["COMPOSE_PROJECT_NAME=${composeProjectName(shard as String)}", "E2E_SHARD=${shard}", "CYPRESS_SPECS=${specs}"]) {
        dockerCompose.buildCmd(
            composeFile: env.DOCKER_COMPOSE_FILE,
            options: ["--force-rm"]
        )

        try {
            catchError(buildResult: 'FAILURE', stageResult: 'FAILURE', catchInterruptions: false) {
                try {
                    dockerCompose.upCmd(
                        environment: getUserUidGidPair(),
                        composeFile: env.DOCKER_COMPOSE_FILE,
                        options: ["--abort-on-container-exit", "--exit-code-from cypress"]
                    )
                } catch (e) {
                    if (isAborted(e)) {
                        throw e
                    }
                    passed = false
                }
            }

            if (!passed) {
                collectGraphdbDiagnostics("graphdb-diagnostics/shard-${shard}")
            }
        } finally {
            composeDown()
        }
    }
    return passed
}

// Video is off in the main run. Reruns the failed specs of all shards once, on a stack of its own, with video on and
// without screenshots (the main run has them), for the archived artifacts. The rerun does not change the build result.
def rerunFailedSpecsWithVideo(List failedShards) {
    def failedSpecs = []
    for (shard in failedShards) {
        def failedSpecsFile = "e2e-tests/report/failed-specs/shard-${shard}.txt"
        if (fileExists(failedSpecsFile)) {
            for (spec in readFile(failedSpecsFile).trim().split('\n')) {
                if (spec) {
                    failedSpecs << spec
                }
            }
        }
    }
    if (!failedSpecs) {
        return
    }
    echo "Rerunning ${failedSpecs.size()} failed specs with video: ${failedSpecs.join(', ')}"
    withEnv(["COMPOSE_PROJECT_NAME=${composeProjectName('rerun')}", "E2E_SHARD=rerun", "CYPRESS_SPECS=${failedSpecs.join(',')}",
             "CYPRESS_VIDEO=true", "CYPRESS_SCREENSHOTS=false"]) {
        dockerCompose.buildCmd(
            composeFile: env.DOCKER_COMPOSE_FILE,
            options: ["--force-rm"]
        )
        try {
            dockerCompose.upCmd(
                environment: getUserUidGidPair(),
                composeFile: env.DOCKER_COMPOSE_FILE,
                options: ["--abort-on-container-exit", "--exit-code-from cypress"]
            )
        } catch (e) {
            if (isAborted(e)) {
                throw e
            }
            echo "The rerun failed too."
        } finally {
            composeDown()
        }
    }
}

// Removes the containers, volumes and images of the compose project from COMPOSE_PROJECT_NAME.
def composeDown() {
    dockerCompose.downCmd(
        composeFile: env.DOCKER_COMPOSE_FILE,
        options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
        ignoreErrors: true
    )
}

// True if the build was aborted, e.g. by a newer push.
def isAborted(e) {
    return e instanceof org.jenkinsci.plugins.workflow.steps.FlowInterruptedException
}

// Copies the GraphDB container output and its logs directory (including the heap dump written on
// OutOfMemoryError) into the workspace. Runs after a failed run, before the containers are removed: they are
// only stopped, so both `logs` and `cp` still work. Every step is best effort, so a missing file never masks
// the test failure.
// Uses the compose project from COMPOSE_PROJECT_NAME.
def collectGraphdbDiagnostics(String outDir) {
    sh """
        mkdir -p '${outDir}'
        docker compose -f '${env.DOCKER_COMPOSE_FILE}' logs --no-color --timestamps graphdb > '${outDir}/graphdb-container.log' 2>&1 || true
        container_id=\$(docker compose -f '${env.DOCKER_COMPOSE_FILE}' ps -aq graphdb)
        if [ -n "\$container_id" ]; then
            docker cp "\$container_id:/opt/graphdb/home/logs/." '${outDir}/logs/' || true
        fi
        if [ -f '${outDir}/logs/heapdump.hprof' ]; then
            gzip -1 '${outDir}/logs/heapdump.hprof' || true
        fi
        ls -lhR '${outDir}'
    """
}

// A compose project name unique to this build, so builds on the same agent never share containers.
// Compose allows only lowercase letters, digits, "-" and "_".
def composeProjectName(String suffix) {
    return "${env.BUILD_TAG}-e2e-${suffix}".toLowerCase().replaceAll(/[^a-z0-9_-]/, '-')
}

def getUserUidGidPair() {
    def uid = sh(script: 'id -u', returnStdout: true).trim()
    def gid = sh(script: 'id -g', returnStdout: true).trim()
    return [UID: uid, GID: gid]
}
