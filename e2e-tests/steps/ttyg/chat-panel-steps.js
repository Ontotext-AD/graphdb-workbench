import {BaseSteps} from "../base-steps.js";

export class ChatPanelSteps extends BaseSteps {

    static getChatPanel() {
        return cy.get('.chat-panel');
    }

    static getChatDetailsElements() {
        return ChatPanelSteps.getChatPanel().find('.chat-detail');
    }

    static getChatDetailElement(index = 0) {
        return ChatPanelSteps.getChatDetailsElements().eq(index).scrollIntoView();
    }

    static getChatDetailActions(chatDetailIndex = 0, answerIndex = 0) {
        return ChatPanelSteps.getChatDetailElement(chatDetailIndex).find('.actions').eq(answerIndex);
    }

    static getAssistantAnswer(index) {
        return ChatPanelSteps.getChatPanel().find('.assistant-message markdown-content').eq(index);
    }

    static getQuestionInputElement() {
        return ChatPanelSteps.getChatPanel().find('.question-input .contenteditable');
    }

    static typeQuestion(question) {
        ChatPanelSteps.getQuestionInputElement().type(question, {force: true});
    }

    static getQuestionLoader() {
        return ChatPanelSteps.getByTestId('question-loader');
    }

    static waitForLoaderToDisappear() {
        ChatPanelSteps.getQuestionLoader().should('not.exist');
    }

    static getAskButtonElement() {
        return ChatPanelSteps.getChatPanel().find('.ask-button');
    }

    static askQuestion() {
        ChatPanelSteps.getAskButtonElement().scrollIntoView().click();
    }

    static askQuestionWithEnter() {
        ChatPanelSteps.getQuestionInputElement().type('{enter}');
    }

    static getChatDetailQuestionElement(index = 0) {
        return ChatPanelSteps.getChatDetailElement(index).find('.question');
    }

    static regenerateQuestion(index, answerIndex = 0) {
        ChatPanelSteps.getChatDetailActions(index, answerIndex).find('.regenerate-question-btn').scrollIntoView().click();
    }

    static copyAnswer(index, answerIndex = 0) {
        ChatPanelSteps.getChatDetailActions(index, answerIndex).find('.copy-answer-btn').click({force: true});
    }

    static getAgentInfoMessages() {
        return ChatPanelSteps.getChatPanel().find('.agent-changed-info');
    }

    static getAgentInfoMessage(index = 0) {
        return ChatPanelSteps.getAgentInfoMessages().eq(index);
    }

    static getOpenInSparqlEditorElements() {
        return ChatPanelSteps.getChatPanel().find('open-in-sparql-editor');
    }

    static getOpenInSparqlEditorElement(index = 0) {
        return ChatPanelSteps.getOpenInSparqlEditorElements().eq(index);
    }

    static getCopyToClipboardElements() {
        return ChatPanelSteps.getChatPanel().find('copy-to-clipboard');
    }

    static getCopyToClipboardElement(index = 0) {
        return ChatPanelSteps.getCopyToClipboardElements().eq(index);
    }

    static getCancelButton() {
        return ChatPanelSteps.getChatPanel().find('.cancel-ask-button');
    }

    static cancelQuestion() {
        ChatPanelSteps.getCancelButton().click();
    }

    static getAssistantIcon(index) {
        return ChatPanelSteps.getChatDetailElement(index).find('.assistant-icon');
    }
}
