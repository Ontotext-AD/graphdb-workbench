@Library('ontotext-platform@v0.1.49') _

/*
 * Release of graphdb-workbench and graphdb-workbench-tests:
 *   1. Validate: the version is well formed, not released yet, and the npm token works.
 *   2. Build the packages with the release version.
 *   3. Push the release commit and tag in one atomic push; rejected when the branch moved.
 *   4. Publish both packages to npm.
 *
 * The steps are in .jenkins/release-steps.groovy, the Slack messages in .jenkins/release-notifications.groovy.
 */

def release
def notifications

pipeline {
    agent {
        label 'aws-small'
    }

    environment {
        // Required for our version of webpack + newer Node.js
        NODE_OPTIONS = "--openssl-legacy-provider"
        NODE_IMAGE = 'node:22.17.0-bullseye'
    }

    parameters {
        gitParameter name: 'GIT_BRANCH',
            description: 'The Git branch to build',
            branchFilter: 'origin/(.*)',
            defaultValue: 'master',
            selectedValue: 'DEFAULT',
            type: 'PT_BRANCH',
            listSize: '0',
            quickFilterEnabled: true

        string name: 'RELEASE_VERSION',
            description: 'Version to release',
            defaultValue: ''

        string(
            name: 'SLACK_CHANNEL',
            defaultValue: '#frontend-notifications',
            description: 'Slack channel notified when the release succeeds, fails or is aborted'
        )

        booleanParam(
            name: 'DRY_RUN',
            defaultValue: false,
            description: 'Build and validate, but run git push and npm publish with --dry-run'
        )
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    stages {
        // On the host, before any docker agent: a failure to start the container is reported too.
        stage('Prepare') {
            steps {
                script {
                    // Loaded before the checkout, so they come from the same commit as this file.
                    release = load '.jenkins/release-steps.groovy'
                    notifications = load '.jenkins/release-notifications.groovy'
                }
            }
        }

        stage('Validate & Build') {
            agent {
                docker {
                    image "${env.NODE_IMAGE}"
                    label 'aws-small'
                    reuseNode true
                    args '-v $WORKSPACE/.npmrc:/home/node/.npmrc --entrypoint=""'
                }
            }
            steps {
                script {
                    release.checkout(params.GIT_BRANCH)
                    release.validate(params.RELEASE_VERSION)
                    release.build(params.RELEASE_VERSION, params.GIT_BRANCH)
                }
            }
        }

        // On the host, not in the container: the push uses the agent's SSH key.
        stage('Push') {
            steps {
                script {
                    release.push(params.RELEASE_VERSION, params.GIT_BRANCH, params.DRY_RUN)
                }
            }
        }

        stage('Publish') {
            agent {
                docker {
                    image "${env.NODE_IMAGE}"
                    label 'aws-small'
                    reuseNode true
                    args '-v $WORKSPACE/.npmrc:/home/node/.npmrc --entrypoint=""'
                }
            }
            steps {
                script {
                    release.publish(params.RELEASE_VERSION, params.DRY_RUN)
                }
            }
        }
    }

    post {
        always {
            script {
                currentBuild.displayName = "${params.RELEASE_VERSION ?: currentBuild.displayName}"
            }
        }
        success {
            script {
                notifications?.released()
            }
        }
        unsuccessful {
            script {
                // Not loaded when the build stopped before Prepare, e.g. in the SCM checkout.
                // No "?.": Groovy would still evaluate release.progress() and throw, skipping the mail.
                if (notifications) {
                    notifications.stopped(release.progress(), currentBuild.currentResult == 'ABORTED')
                }
            }
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }
        cleanup {
            script {
                release?.cleanup(params.RELEASE_VERSION)
            }
        }
    }
}
