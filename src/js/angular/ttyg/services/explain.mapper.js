import {ExplainQueryMethodModel, ExplainResponseModel} from "../../models/ttyg/explain-response";

/**
 * Converts the response from the server to a ExplainResponseModel.
 *
 * @param {*} data
 * @return {ExplainResponseModel}
 */
export const explainResponseMapper = (data) => {
    return new ExplainResponseModel({
        chatId: data.conversationId,
        answerId: data.answerId,
        queryMethods: data.queryMethods
    });
};

/**
 * Converts the response from the server to a ExplainQueryMethodsListModel.
 *
 * @param {*} data
 * @return {ExplainQueryMethodsListModel}
 */
export const explainQueryMethodsListMapper = (data = []) => {
    return data.map(explainQueryMethodMapper);
};

/**
 * Converts the response from the server to a ExplainQueryMethodModel.
 *
 * @param {*} data
 * @return {ExplainQueryMethodModel}
 */
export const explainQueryMethodMapper = (data) => {
    return new ExplainQueryMethodModel(data);
};
