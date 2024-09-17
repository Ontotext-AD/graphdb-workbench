export class ChatPanelSteps {

    static getChatPanel() {
        return cy.get('.chat-panel');
    }

    static getChatDetailsElements() {
        return ChatPanelSteps.getChatPanel().find('.chat-detail');
    }

    static getChatDetailElement(index = 0) {
        return ChatPanelSteps.getChatDetailsElements().eq(index).scrollIntoView();
    }

    static getChatDetailActions(index = 0) {
        return ChatPanelSteps.getChatDetailElement(index).find('.actions');
    }

    static getQuestionInputElement() {
        return ChatPanelSteps.getChatPanel().find('.question-input');
    }

    static getAskButtonElement() {
        return ChatPanelSteps.getChatPanel().find('.ask-button');
    }

    static getChatDetailQuestionElement(index = 0) {
        return ChatPanelSteps.getChatDetailElement(index).find('.question');
    }

    static regenerateQuestion(index) {
        ChatPanelSteps.getChatDetailActions(index).find('.regenerate-question-btn').scrollIntoView().click();
    }
    static copyAnswer(index) {
        ChatPanelSteps.getChatDetailActions(index).find('.copy-answer-btn').click();
    }
}
