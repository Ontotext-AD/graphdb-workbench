@Library('ontotext-platform@GDB-11897-Migrate-pipelines-new-Jenkins') _
def performCleanup = {
    node('aws-small') {
        sh "git checkout .npmrc"
        dir("test-cypress/") {
            sh "rm -f .npmrc"
        }
    }
}
pipeline {
    environment {
        // Needed for our version of webpack + newer nodejs
        NODE_OPTIONS = "--openssl-legacy-provider"
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
        label 'aws-small'
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage ('Prepare') {
            steps {
                script {
                    git_cmd.checkout(branch: branch)
                    npm.prepareRelease(version: ReleaseVersion, scripts: ['build'])
                    npm.prepareRelease(version: ReleaseVersion, dir: "test-cypress/")
                }
            }
        }

        stage ('Publish') {
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
                        mkdir -p ~/.ssh
                        ssh-keyscan github.com >> ~/.ssh/known_hosts
                        echo "[INFO] Testing SSH access..."
                        ssh -T git@github.com || true
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
