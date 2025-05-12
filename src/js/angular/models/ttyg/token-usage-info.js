/**
 * Represents token usage details for an AI interaction.
 * This class tracks the number of tokens used in the prompt (input), the completion (output),
 * and the total number of tokens consumed.
 */
export class TokenUsageInfo {
    /**
     * @param {Object} data - The data object containing token usage information.
     * @param {number} data.promptTokens - The number of tokens in the input prompt (i.e., the conversation history, user query, and system instructions).
     * @param {number} data.completionTokens - The number of tokens used in the model's response.
     * @param {number} data.totalTokens - data.totalTokens - The sum of both (completionTokens + promptTokens).
     */
    constructor(data) {
        this._totalTokens = data.totalTokens;
        this._promptTokens = data.promptTokens;
        this._completionTokens = data.completionTokens;
    }

    /**
     * Gets the number of tokens in the input prompt (i.e., the conversation history, user query, and system instructions).
     * @return {number}
     */
    get promptTokens() {
        return this._promptTokens;
    }

    /**
     * Gets the number of tokens used in the model's response.
     * @return {number}
     */
    get completionTokens() {
        return this._completionTokens;
    }

    /**
     * Gets the total number of tokens used (the sum of completionTokens and promptTokens).
     * @return {number}
     */
    get totalTokens() {
        return this._totalTokens;
    }
}
