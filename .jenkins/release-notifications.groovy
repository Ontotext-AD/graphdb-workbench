/**
 * How release.Jenkinsfile reports its result, loaded with `load`: a Slack message on every result,
 * and the step where the release stopped in the build description.
 *
 * `progress` is the map from release-steps.groovy: step, detail, hint, published (list) and abortReason.
 */

void released() {
    notifySlack('good', [messageHeader('🚀', 'released'), messageFooter()].join('\n'))
}

void stopped(Map progress, boolean aborted) {
    currentBuild.description = "${aborted ? 'Aborted' : 'Failed'} at: ${progress.step}"
    if (aborted) {
        String reason = progress.abortReason ? " (${progress.abortReason})" : ''
        // An abort is not a broken step: with nothing published, a plain rerun is the way out.
        String next = progress.published ? progress.hint : 'Rerun the release with the same version.'
        notifySlack('warning', stoppedMessage(progress, '⏹', "release aborted${reason}", next))
    } else {
        notifySlack('danger', stoppedMessage(progress, '💥', 'release failed', progress.hint))
    }
}

String stoppedMessage(Map progress, String emoji, String text, String next) {
    String step = progress.detail ? "${progress.step}: ${progress.detail}" : progress.step
    String published = progress.published ? progress.published.join(', ') : 'nothing'
    return [
        messageHeader(emoji, text),
        "*Step:* ${step}",
        "*Published:* ${published}",
        "*Next:* ${next}",
        messageFooter()
    ].join('\n')
}

String messageHeader(String emoji, String text) {
    String prefix = params.DRY_RUN ? '🧪 DRY RUN · ' : ''
    return "${prefix}${emoji} *graphdb-workbench v${params.RELEASE_VERSION}* ${text}"
}

String messageFooter() {
    def userCauses = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
    String startedBy = userCauses ? "by ${userCauses[0].userName} · " : ''
    String duration = currentBuild.durationString.replace(' and counting', '')
    return "${startedBy}${duration} · <${env.BUILD_URL}|#${env.BUILD_NUMBER}>"
}

void notifySlack(String color, String message) {
    try {
        slack.notifyResult(channel: params.SLACK_CHANNEL, color: color, message: message)
    } catch (e) {
        echo "Slack notification failed: ${e.getMessage()}"
    }
}

return this
