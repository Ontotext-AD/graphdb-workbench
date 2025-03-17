@Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
pipeline {
    environment {
        NPM_TOKEN = credentials('npm-token')
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
        AGENT = 'aws-small'
        SLACK_CHANNEL = "#graphdb-team"
    }

    tools {
        nodejs 'nodejs-18.9.0'
    }

    parameters {
        gitParameter name: 'branch',
            description: 'The branch to check out',
            branchFilter: 'origin/(.*)',
            defaultValue: 'master',
            selectedValue: 'DEFAULT',
            type: 'PT_BRANCH',
            listSize: '0',
            quickFilterEnabled: true

        string name: 'ReleaseVersion',
             description: 'Version to release',
             defaultValue: ''
    }

    agent {
        label env.AGENT
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage ('Prepare') {
            steps {
//                 script {
                    sh "git checkout ${branch}"
                    // Change versions
                    sh "npm version --git-tag-version=false ${ReleaseVersion}"
                    dir("test-cypress/") {
                      sh "npm version --git-tag-version=false ${ReleaseVersion}"
                    }

                    // Install
                    sh "npm ci"

                    // Build
                    sh "npm run build"
//                     npm.prepareRelease(version: ReleaseVersion, scripts: ['build'])
//                     npm.prepareRelease(version: ReleaseVersion, directory: "test-cypress/")
//                 }
            }
        }

        stage ('Publish') {
            steps {
                withKsm(application: [
                    [
                        credentialsId: 'ksm-jenkins',
                        secrets: [
                            [destination: 'env', envVar: 'NPM_TOKEN', filePath: '', notation: 'keeper://FLqZTV1kiAkyLgViFIj_tQ'],
                        ]
                    ]
                ]){
                    // Publish on npm
                    sh "echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc && npm publish"
                    // Publish cypress tests on npm
                    dir("test-cypress/") {
                        sh "echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc && npm publish"
                    }
               }
            }
        }
    }

    post {
        success {
            script {
                // Commit, tag and push the changes in Git
                sh "git commit -a -m 'Release ${ReleaseVersion}'"
                sh "git tag -a v${ReleaseVersion} -m 'Release v${ReleaseVersion}'"
                sh "git push --set-upstream origin ${branch} && git push --tags"
                slack.notifyResult(channel: env.SLACK_CHANNEL, color:'good', message:"Released v${ReleaseVersion}")
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }

        always {
            script {
                node(env.AGENT) {
                    sh "git checkout .npmrc"
                    dir("test-cypress/") {
                        sh "rm .npmrc"
                    }
                }
            }
        }
    }
}
