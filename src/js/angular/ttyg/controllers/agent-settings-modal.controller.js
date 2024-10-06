import {decodeHTML} from "../../../../app";
import {ExtractionMethod} from "../../models/ttyg/agents";
import 'angular/core/services/similarity.service';
import 'angular/core/services/connectors.service';
import 'angular/core/services/ttyg.service';
import 'angular/rest/repositories.rest.service';
import {REPOSITORY_PARAMS} from "../../models/repository/repository";
import {TTYGEventName} from "../services/ttyg-context.service";
import {AGENT_OPERATION} from "../services/constants";

angular
    .module('graphdb.framework.ttyg.controllers.agent-settings-modal', [
        'graphdb.framework.core.services.similarity',
        'graphdb.framework.core.services.connectors',
        'graphdb.framework.rest.repositories.service'
    ])
    .controller('AgentSettingsModalController', AgentSettingsModalController);

AgentSettingsModalController.$inject = [
    '$scope',
    '$uibModalInstance',
    'SimilarityService',
    'ConnectorsService',
    'RepositoriesRestService',
    '$sce',
    'toastr',
    'UriUtils',
    '$translate',
    'dialogModel',
    'TTYGContextService',
    'TTYGService'];

function AgentSettingsModalController(
    $scope,
    $uibModalInstance,
    SimilarityService,
    ConnectorsService,
    RepositoriesRestService,
    $sce,
    toastr,
    UriUtils,
    $translate,
    dialogModel,
    TTYGContextService,
    TTYGService) {

    // =========================
    // Private variables
    // =========================

    const CHAT_GPT_RETRIEVAL_CONNECTOR_NAME = 'ChatGPT Retrieval';

    // =========================
    // Public variables
    // =========================

    $scope.AGENT_OPERATION = AGENT_OPERATION;

    /**
     * The operation type for the modal. This can be one of <code>AGENT_OPEATION</code> constants.
     */
    $scope.operation = dialogModel.operation;

    /**
     * Flag to control the visibility of the loader when creating an agent.
     * @type {boolean}
     */
    $scope.savingAgent = false;

    /**
     * The model used in the form.
     * @type {AgentFormModel|*}
     */
    $scope.agentFormModel = dialogModel.agentFormModel;

    /**
     * The active repository info model.
     * @type {RepositoryInfoModel|*}
     */
    $scope.activeRepositoryInfo = dialogModel.activeRepositoryInfo;

    /**
     * Flags used to show/hide the loader for the extraction methods when the user opens a panel and some data needs to
     * be loaded.
     * @type {{[string]: boolean}} - the key is the extraction method types in <code>ExtractionMethod</code>
     */
    $scope.extractionMethodLoaderFlags = {
      [ExtractionMethod.SIMILARITY]: false
    };

    /**
     * The repository select menu options model.
     * @type {SelectMenuOptionsModel[]}
     */
    $scope.activeRepositoryList = dialogModel.activeRepositoryList;

    /**
     * The extraction method types constants.
     * @type {{SPARQL: string, FTS_SEARCH: string, SIMILARITY: string, RETRIEVAL: string}}
     */
    $scope.extractionMethods = ExtractionMethod;

    /**
     * Flag used to show/hide the advanced settings in the modal.
     * @type {boolean}
     */
    $scope.showAdvancedSettings = false;

    /**
     * The similarity indexes to be used for the similarity extraction method as select menu options.
     * @type {SelectMenuOptionsModel[]}
     */
    $scope.similarityIndexes = [];

    /**
     * The retrieval connectors to be used for the retrieval extraction method as select menu options.
     * @type {SelectMenuOptionsModel[]}
     */
    $scope.retrievalConnectors = [];

    /**
     * Flag used to show/hide the FTS enabled state in the modal.
     * @type {boolean}
     */
    $scope.ftsEnabled = false;

    // =========================
    // Public functions
    // =========================

    /**
     * Sets the UI touched state and validation state for the extraction methods property so that the UI can show if
     * the user has selected at least one extraction method and warn him if he hasn't.
     *
     * @param {ExtractionMethodFormModel} extractionMethod
     */
    $scope.toggleExtractionMethod = (extractionMethod) => {
        // FIXME: Using jQuery is highly unwanted, but I couldn't find a better way to do it, so that the interaction is not affected
        const target = `#${extractionMethod.method}_method_content`;
        if (extractionMethod.selected) {
            $(target).collapse('show');
        } else {
            $(target).collapse('hide');
        }
        $scope.agentSettingsForm.extractionMethods.$setTouched();
        setExtractionMethodValidityStatus();
        $scope.onExtractionMethodPanelToggle(extractionMethod);
    };

    /**
     * Handles the panel toggle event for the extraction method. This is used to do some initialization when the user
     * opens the panel for a specific extraction method.
     * @param {ExtractionMethodModel} extractionMethod
     */
    $scope.onExtractionMethodPanelToggle = (extractionMethod) => {
        extractionPanelToggleHandlers[extractionMethod.method](extractionMethod);
    };

    /**
     * Resolves the hint message for the agent model property. This is needed because the hint contains a html link that
     * should be properly rendered.
     * @return {*}
     */
    $scope.getModelHelpMessage = () => {
        // The hint contains a html link which should be properly rendered.
        const message = decodeHTML($translate.instant('ttyg.agent.create_agent_modal.form.model.hint'));
        return $sce.trustAsHtml(message);
    };

    /**
     * Resolves the hint for the FTS search missing message. This is needed because the hint contains a html link that
     * should be properly rendered.
     * @return {*}
     */
    $scope.getFTSDisabledHelpMessage = () => {
        // The hint contains a html link which should be properly rendered.
        const message = decodeHTML(
            $translate.instant(
                'ttyg.agent.create_agent_modal.form.fts_search.fts_disabled_message',
                {repositoryEditPage: '#/repository/edit/' + $scope.agentFormModel.repositoryId}
            )
        );
        return $sce.trustAsHtml(message);
    };

    /**
     * Opens the 'Create Similarity' view in a new tab.
     */
    $scope.goToCreateSimilarityView = () => {
        TTYGContextService.emit(TTYGEventName.GO_TO_CREATE_SIMILARITY_VIEW, {repositoryId: $scope.agentFormModel.repositoryId});
    };

    /**
     * Opens the 'Connectors' view in a new tab.
     */
    $scope.goToConnectorsView = () => {
        TTYGContextService.emit(TTYGEventName.GO_TO_CONNECTORS_VIEW, {repositoryId: $scope.agentFormModel.repositoryId});
    };

    /**
     * Handles the selected agent operation which can be one of <code>AGENT_OPERATION</code> types. Respective handler
     * is called based on the operation type with the agent payload build based on the form model.
     * @return {Promise<void>}
     */
    $scope.ok = () => {
        const agentPayload = $scope.agentFormModel.toPayload();
        return agentOperationHandlers[$scope.operation](agentPayload);
    };

    /**
     * Closes the modal when the user cancels the agent creation.
     */
    $scope.cancel = function () {
        $uibModalInstance.dismiss({});
    };

    /**
     * Closes the modal when the user clicks the close button.
     */
    $scope.close = function () {
        $uibModalInstance.dismiss({});
    };

    /**
     * Handles the change in the repository id field. This is needed because
     * the FTS method configuration depends on the selected repository to be
     * able to validate if the FTS is enabled for that selected repository.
     */
    $scope.onRepositoryChange = () => {
        checkIfFTSEnabled();
    };

    // =========================
    // Private functions
    // =========================

    /**
     * Mapping of agent operations to their respective handlers.
     * @type {{[AGENT_OPERATION.EDIT]: (function(*): Promise<void>), [AGENT_OPERATION.CLONE]: (function(*): Promise<void>), [AGENT_OPERATION.CREATE]: (function(*): Promise<void>)}}
     */
    const agentOperationHandlers = {
        [AGENT_OPERATION.CREATE]: (payload) => createAgent(payload),
        [AGENT_OPERATION.EDIT]: (payload) => editAgent(payload),
        [AGENT_OPERATION.CLONE]: (payload) => cloneAgent(payload)
    };

    /**
     * Creates a new agent with the given payload and closes the modal if no errors occur.
     * @param {*} newAgentPayload - the payload for the new agent.
     * @return {Promise<void>}
     */
    const createAgent = (newAgentPayload) => {
        $scope.savingAgent = true;
        return TTYGService.createAgent(newAgentPayload)
            .then((agentModel) => {
                $uibModalInstance.close(agentModel);
                toastr.success($translate.instant('ttyg.agent.messages.agent_save_successfully', {agentName: agentModel.name}));
            })
            .catch((error) => {
                toastr.error(getError(error, 0, 100));
            })
            .finally(() => {
                $scope.savingAgent = false;
            });
    };

    /**
     * Sends the edit agent payload to the server and closes the modal if no errors occur.
     * @param {*} agentPayload - the payload for the agent to be edited.
     * @return {Promise<void>}
     */
    const editAgent = (agentPayload) => {
        $scope.savingAgent = true;
        return TTYGService.editAgent(agentPayload)
            .then((updatedAgent) => {
                $uibModalInstance.close(updatedAgent);
                toastr.success($translate.instant('ttyg.agent.messages.agent_save_successfully', {agentName: updatedAgent.name}));
            })
            .catch(() => {
                toastr.error($translate.instant('ttyg.agent.messages.agent_save_failure', {agentName: agentPayload.name}));
            })
            .finally(() => {
                $scope.savingAgent = false;
            });
    };

    /**
     * Clones the agent with the given payload and closes the modal if no errors occur.
     * @param {*} agentPayload
     * @return {Promise<void>}
     */
    const cloneAgent = (agentPayload) => {
        $scope.savingAgent = true;
        return TTYGService.createAgent(agentPayload)
            .then((updatedAgent) => {
                $uibModalInstance.close(updatedAgent);
                toastr.success($translate.instant("ttyg.agent.messages.agent_save_successfully", {agentName: updatedAgent.name}));
            })
            .catch(() => {
                toastr.error($translate.instant("ttyg.agent.messages.agent_save_failure", {agentName: agentPayload.name}));
            })
            .finally(() => {
                $scope.savingAgent = false;
            });
    };

    const logAndShowError = (error, errorMessageKey) => {
        console.error(error);
        toastr.error($translate.instant(errorMessageKey));
    };

    const setExtractionMethodValidityStatus = () => {
        $scope.agentSettingsForm.extractionMethods.$setValidity('required', $scope.agentFormModel.hasExtractionMethodSelected());
    };

    const checkIfFTSEnabled = () => {
        if (!$scope.agentFormModel.repositoryId) {
            return;
        }
        // pass a fake repository info object with only an id because we don't care for the location
        RepositoriesRestService.getRepositoryModel({id: $scope.agentFormModel.repositoryId}).then((repositoryModel) => {
            $scope.ftsEnabled = repositoryModel.getParamValue(REPOSITORY_PARAMS.enableFtsIndex);
        })
        .catch((error) => {
            logAndShowError(error, 'ttyg.agent.messages.error_repository_config_loading');
        })
        .finally(() => {
            $scope.extractionMethodLoaderFlags[ExtractionMethod.FTS_SEARCH] = false;
        });
    };

    const handleFTSExtractionMethodPanelToggle = (extractionMethod) => {
        $scope.extractionMethodLoaderFlags[extractionMethod.method] = true;
        checkIfFTSEnabled();
    };

    const handleSimilaritySearchExtractionMethodPanelToggle = (extractionMethod) => {
        $scope.extractionMethodLoaderFlags[extractionMethod.method] = true;
        SimilarityService.getIndexesAsMenuModel().then((indexes) => {
            $scope.similarityIndexes = indexes;
            $scope.agentSettingsForm.$setValidity('missingIndex', !extractionMethod.selected || !!(indexes && indexes.length));
        })
        .catch((error) => {
            logAndShowError(error, 'ttyg.agent.messages.error_similarity_indexes_loading');
        })
        .finally(() => {
            $scope.extractionMethodLoaderFlags[extractionMethod.method] = false;
        });
    };

    const handleRetrieavalConnectorExtractionMethodPanelToggle = (extractionMethod) => {
        $scope.extractionMethodLoaderFlags[extractionMethod.method] = true;
        ConnectorsService.getConnectorPrefixByName(CHAT_GPT_RETRIEVAL_CONNECTOR_NAME)
            .then((prefix) => {
                return ConnectorsService.getConnectorsByTypeAsSelectMenuOptions(prefix);
            })
            .then((connectors) => {
                $scope.retrievalConnectors = connectors;
                $scope.agentSettingsForm.$setValidity('missingConnector', !extractionMethod.selected || !!(connectors && connectors.length));
            })
            .catch((error) => {
                logAndShowError(error, 'ttyg.agent.messages.error_retrieval_connectors_loading');
            })
            .finally(() => {
                $scope.extractionMethodLoaderFlags[extractionMethod.method] = false;
            });
    };

    const extractionPanelToggleHandlers = {
        [ExtractionMethod.FTS_SEARCH]: (extractionMethod) => handleFTSExtractionMethodPanelToggle(extractionMethod),
        [ExtractionMethod.SPARQL]: (extractionMethod) => {},
        [ExtractionMethod.SIMILARITY]: (extractionMethod) => handleSimilaritySearchExtractionMethodPanelToggle(extractionMethod),
        [ExtractionMethod.RETRIEVAL]: (extractionMethod) => handleRetrieavalConnectorExtractionMethodPanelToggle(extractionMethod)
    };

    // =========================
    // Initialization
    // =========================

    const init = function () {
        // Delay the validation status setting because angular form ngmodel is not present immediately
        setTimeout(setExtractionMethodValidityStatus, 0);
    };
    init();
}
