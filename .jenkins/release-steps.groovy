/**
 * The steps of release.Jenkinsfile, loaded with `load`.
 *
 * Every step records itself in `progress`, so that a failure or an abort can say where the release
 * stopped, what was already published and what to do next.
 */

import groovy.transform.Field
import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

@Field
Map progress = [
    step       : 'Start',
    detail     : '',
    hint       : 'Rerun the release.',
    published  : [],
    abortReason: ''
]

Map progress() {
    return progress
}

void checkout(String branch) {
    track('Checkout', 'Rerun the release.') {
        git_cmd.checkout(branch: branch)
    }
}

/**
 * Fails before anything is built when the version is malformed or already released, or the npm token is invalid.
 */
void validate(String version) {
    track('Validate', 'Fix the problem above, then rerun the release.') {
        if (!(version ==~ /\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?/)) {
            fail("RELEASE_VERSION '${version}' is not X.Y.Z or X.Y.Z-suffix", 'Rerun the release with a valid RELEASE_VERSION.')
        }

        int tagStatus = sh(returnStatus: true,
            script: "git ls-remote --exit-code --tags https://github.com/Ontotext-AD/graphdb-workbench.git refs/tags/v${version} > /dev/null")
        if (tagStatus == 0) {
            fail("tag v${version} already exists on GitHub", 'Rerun the release with an unused RELEASE_VERSION.')
        }
        if (tagStatus != 2) {
            fail('could not read the tags from GitHub', 'Rerun the release.')
        }

        for (String pkg : ['graphdb-workbench', 'graphdb-workbench-tests']) {
            // 0: not in npm, 1: already in npm, 2: npm could not be read
            int npmStatus = sh(returnStatus: true, script: """
                out=\$(npm view ${pkg}@${version} version 2>&1) && { [ -z "\$out" ] && exit 0 || exit 1; }
                echo "\$out" | grep -q E404 && exit 0
                echo "\$out"
                exit 2
            """)
            if (npmStatus == 1) {
                fail("${pkg}@${version} is already in npm", 'Rerun the release with an unused RELEASE_VERSION.')
            }
            if (npmStatus != 0) {
                fail("could not read ${pkg} from npm", 'Rerun the release.')
            }
        }

        withNpmToken {
            // A temporary user config keeps the token out of the .npmrc that the build container mounts.
            int whoamiStatus = sh(returnStatus: true, script: '''
                npmrc=$(mktemp)
                trap 'rm -f "$npmrc"' EXIT
                echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > "$npmrc"
                npm whoami --userconfig "$npmrc"
            ''')
            if (whoamiStatus != 0) {
                fail('npm authentication failed: invalid or expired NPM_TOKEN', 'Renew the NPM_TOKEN in Keeper, then rerun the release.')
            }
        }
    }
}

void build(String version, String branch) {
    track('Build', "Fix the build on ${branch}, then rerun the release.") {
        npm.prepareRelease(version: version, scripts: ['install:ci', 'build'])
        npm.prepareRelease(version: version, dir: 'e2e-tests/')
    }
}

/**
 * Commits and tags the release, then pushes the branch and the tag in one atomic push.
 * The push is rejected, and nothing is published, when the branch moved during the build.
 */
void push(String version, String branch, boolean dryRun) {
    track('Git push', 'Check the GitHub access, then rerun the release with the same version.') {
        withKsm(application: [
            [
                credentialsId: 'ksm-jenkins',
                secrets: [
                    [destination: 'env', envVar: 'GIT_USER', filePath: '', notation: 'keeper://8hm1g9HCfBPgoWAmpiHn6w/field/login']
                ]
            ]
        ]) {
            sh 'mkdir -p ~/.ssh'
            sh 'ssh-keyscan github.com >> ~/.ssh/known_hosts'

            sh 'git config --global user.name "$GIT_USER"'
            sh 'git config --global user.email "$GIT_USER@users.noreply.github.com"'

            sh "git commit --no-verify -a -m 'Release ${version}'"
            sh "git tag -a v${version} -m 'Release v${version}'"

            sh 'git remote set-url origin git@github.com:Ontotext-AD/graphdb-workbench.git'
            int status = sh(returnStatus: true,
                script: "git push --atomic${dryRunFlag(dryRun)} origin HEAD:refs/heads/${branch} refs/tags/v${version} > .git/release-push.log 2>&1")
            String output = readFile('.git/release-push.log')
            echo output
            if (status != 0) {
                if (output.contains('[rejected]')) {
                    fail("${branch} moved during the build", 'Rerun the release with the same version.')
                }
                fail('git push failed', 'Check the GitHub access, then rerun the release with the same version.')
            }
            if (!dryRun) {
                progress.published << "git tag v${version}"
            }
        }
    }
    // From here on the tag is on GitHub: a failure before the first publish must not advise a rerun.
    progress.step = 'npm publish'
    progress.hint = "Publish graphdb-workbench and graphdb-workbench-tests ${version} manually from tag v${version}."
}

void publish(String version, boolean dryRun) {
    track('npm publish graphdb-workbench',
        "Publish graphdb-workbench and graphdb-workbench-tests ${version} manually from tag v${version}.") {
        withNpmToken {
            writeNpmToken()
            sh "npm publish${dryRunFlag(dryRun)}"
        }
        if (!dryRun) {
            progress.published << 'npm graphdb-workbench'
        }
    }
    track('npm publish graphdb-workbench-tests',
        "Publish graphdb-workbench-tests ${version} manually from tag v${version}.") {
        withNpmToken {
            dir('e2e-tests/') {
                writeNpmToken()
                sh "npm publish${dryRunFlag(dryRun)}"
            }
        }
        if (!dryRun) {
            progress.published << 'npm graphdb-workbench-tests'
        }
    }
}

/**
 * Removes the npm token, and the local release commit and tag that were not pushed,
 * so that a rerun of the same version starts from the branch.
 */
void cleanup(String version) {
    dir("${env.WORKSPACE}") {
        sh 'git restore .npmrc || git checkout HEAD -- .npmrc'
        sh 'rm -f e2e-tests/.npmrc'
        withEnv(["RELEASE_VERSION=${version}", "RELEASE_PUSHED=${progress.published ? 'true' : 'false'}"]) {
            sh '''
                git tag -d "v$RELEASE_VERSION" 2>/dev/null || true
                if [ "$RELEASE_PUSHED" = false ] && [ "$(git log -1 --format=%s)" = "Release $RELEASE_VERSION" ]; then
                    git reset --hard HEAD~1
                fi
            '''
        }
    }
}

void track(String name, String hint, Closure body) {
    progress.step = name
    progress.detail = ''
    progress.hint = hint
    try {
        body()
    } catch (FlowInterruptedException e) {
        progress.abortReason = interruptionReason(e)
        throw e
    }
}

void fail(String detail, String hint) {
    progress.detail = detail
    progress.hint = hint
    error(detail)
}

String interruptionReason(FlowInterruptedException e) {
    try {
        String cause = e.causes ? e.causes[0].shortDescription : ''
        if (cause.toLowerCase().contains('timeout')) {
            return 'timeout'
        }
        return cause.replaceFirst(/^Aborted /, '')
    } catch (readError) {
        echo "Could not read the abort reason: ${readError.getMessage()}"
        return ''
    }
}

void withNpmToken(Closure body) {
    withKsm(application: [
        [
            credentialsId: 'ksm-jenkins',
            secrets: [
                [destination: 'env', envVar: 'NPM_TOKEN', filePath: '', notation: 'keeper://FcbEgbi287PN2yx_3uCz4Q/field/note'],
            ]
        ]
    ]) {
        body()
    }
}

void writeNpmToken() {
    sh 'echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc'
}

String dryRunFlag(boolean dryRun) {
    return dryRun ? ' --dry-run' : ''
}

return this
