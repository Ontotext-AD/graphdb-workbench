@Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
def performCleanup = {
    dir("${env.WORKSPACE}") {
        sh "git checkout .npmrc"
        dir("test-cypress") {
            sh "rm -f .npmrc"
        }
    }
}
pipeline {
     agent {
        label 'aws-small'
     }

    environment {
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
        // node:18.20.7-bullseye
        NODE_IMAGE = 'node@sha256:499f6196f83d1a9600b53560ba81b8861682976988f51b879c6604efc9a8cd33'
        SLACK_CHANNEL = "#graphdb-team"
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

    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage ('Prepare') {
            agent {
                docker {
                    image env.NODE_IMAGE
                    reuseNode true
                    args '--entrypoint=""'
                }
            }
            steps {
                script {
                    git_cmd.checkout(branch: branch)
                    npm.prepareRelease(version: ReleaseVersion, scripts: ['build'])
                    npm.prepareRelease(version: ReleaseVersion, dir: "test-cypress/")
                }
            }
        }

        stage ('Publish') {
            agent {
                docker {
                    image env.NODE_IMAGE
                    reuseNode true
                    args '--entrypoint=""'
                }
            }
            steps {
                withKsm(application: [
                    [
                        credentialsId: 'ksm-jenkins',
                        secrets: [
                            [destination: 'env', envVar: 'NPM_TOKEN', filePath: '', notation: 'keeper://FcbEgbi287PN2yx_3uCz4Q/field/note'],
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
                // Commit & tag
                sh "git commit -a -m 'Release ${ReleaseVersion}'"
                sh "git tag -a v${ReleaseVersion} -m 'Release v${ReleaseVersion}'"
                withKsm(application: [
                    [
                        credentialsId: 'ksm-jenkins',
                        secrets: [
                            [destination: 'env', envVar: 'GIT_USER', filePath: '', notation: 'keeper://8hm1g9HCfBPgoWAmpiHn6w/field/login'],
                            [destination: 'env', envVar: 'GIT_TOKEN', filePath: '', notation: 'keeper://8hm1g9HCfBPgoWAmpiHn6w/field/password']
                        ]
                    ]
                ]) {
                    sh """
                        // TODO: Remove the following block once the Jenkins VM image includes GitHub's SSH host key
                        // This is a temporary workaround for "Host key verification failed" errors during git push via SSH
                        mkdir -p ~/.ssh
                        ssh-keyscan github.com >> ~/.ssh/known_hosts

                        git config --global user.name "$GIT_USER"
                        git config --global user.email "$GIT_USER@users.noreply.github.com"
                        git remote set-url origin git@github.com:Ontotext-AD/graphdb-workbench.git
                        git push --set-upstream origin ${branch}
                        git push --tags
                    """
                }

                slack.notifyResult(channel: env.SLACK_CHANNEL, color:'good', message:"Released v${ReleaseVersion}")
                performCleanup()
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }

            script {
                performCleanup()
            }
        }
    }
}
