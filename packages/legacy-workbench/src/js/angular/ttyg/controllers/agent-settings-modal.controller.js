import {decodeHTML} from "../../../../app";
import {AdditionalExtractionMethod, ExtractionMethod} from "../../models/ttyg/agents";
import 'angular/core/services/similarity.service';
import 'angular/core/services/connectors.service';
import 'angular/core/services/ttyg.service';
import 'angular/rest/repositories.rest.service';
import 'angular/ttyg/controllers/agent-instructions-explain-modal.controller';
import {REPOSITORY_PARAMS} from "../../models/repository/repository";
import {TTYGEventName} from "../services/ttyg-context.service";
import {AGENT_OPERATION, TTYG_ERROR_MSG_LENGTH} from "../services/constants";
import {mapUriAsNtripleAutocompleteResponse} from "../../rest/mappers/autocomplete-mapper";

angular
    .module('graphdb.framework.ttyg.controllers.agent-settings-modal', [
        'graphdb.framework.core.services.similarity',
        'graphdb.framework.core.services.connectors',
        'graphdb.framework.rest.repositories.service',
        'graphdb.framework.ttyg.controllers.agent-instructions-explain-modal',
        'ngTagsInput'
    ])
    .constant('ExtractionMethodTemplates', {
    'iri_discovery_search': 'iri-discovery-search',
        // Temporarily hidden template until the feature is fine-tuned
    //'autocomplete_iri_discovery_search': 'autocomplete-iri-discovery-search'
    })
    .controller('AgentSettingsModalController', AgentSettingsModalController);

AgentSettingsModalController.$inject = [
    '$scope',
    '$uibModalInstance',
    'ModalService',
    '$uibModal',
    'SimilarityService',
    'ConnectorsService',
    'RepositoriesRestService',
    '$sce',
    'toastr',
    'UriUtils',
    '$translate',
    'dialogModel',
    'TTYGContextService',
    'TTYGService',
    'ExtractionMethodTemplates',
    'AutocompleteService',
    'AutocompleteRestService'];

function AgentSettingsModalController(
    $scope,
    $uibModalInstance,
    ModalService,
    $uibModal,
    SimilarityService,
    ConnectorsService,
    RepositoriesRestService,
    $sce,
    toastr,
    UriUtils,
    $translate,
    dialogModel,
    TTYGContextService,
    TTYGService,
    ExtractionMethodTemplates,
    AutocompleteService,
    AutocompleteRestService) {

    // =========================
    // Private variables
    // =========================

    const CHAT_GPT_RETRIEVAL_CONNECTOR_NAME = 'ChatGPT Retrieval';

    // =========================
    // Public variables
    // =========================

    $scope.AGENT_OPERATION = AGENT_OPERATION;

    /**
     * The operation type for the modal. This can be one of <code>AGENT_OPERATION</code> constants.
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
     * The additional extraction method types constants.
     * @type {{IRI_DISCOVERY_SEARCH: string, AUTOCOMPLETE_IRI_DISCOVERY_SEARCH: string}}
     */
    $scope.additionalExtractionMethods = AdditionalExtractionMethod;

    /**
     * The names of the template files, containing the Extraction Method Templates.
     * @type {Object<string, string>}
     */
    $scope.ExtractionMethodTemplates = ExtractionMethodTemplates;

    /**
     * Flag used to show/hide the advanced settings in the modal.
     * @type {boolean}
     */
    $scope.showAdvancedSettings = false;

    /**
     * Flag used to show/hide the high temperature warning in the modal.
     * @type {boolean}
     */
    $scope.showHighTemperatureWarning = false;

    /**
     * Flag used to control the visibility of the system instruction warning.
     * @type {boolean}
     */
    $scope.showSystemInstructionWarning = false;

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

    /**
     * The autocomplete suggestions source for the 'Autocomplete IRI discovery' extraction method.
     * @type {*[]}
     */
    $scope.autocompleteSuggestions = [];

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
        extractionMethod.expanded = extractionMethod.selected;
        $scope.agentSettingsForm.extractionMethods.$setTouched();
        setExtractionMethodValidityStatus();
        extractionPanelToggleHandlers[extractionMethod.method](extractionMethod);
    };

    /**
     * Handles the panel toggle event for the extraction method. This is used to do some initialization when the user
     * opens the panel for a specific extraction method.
     * @param {ExtractionMethodFormModel} extractionMethod
     */
    $scope.onExtractionMethodPanelToggle = (extractionMethod) => {
        extractionMethod.toggleCollapse();
        extractionPanelToggleHandlers[extractionMethod.method](extractionMethod);
    };

    /**
     * Sets the UI touched state and validation state for the additional extraction methods property so that the UI can show if
     * the user has selected at least one extraction method.
     *
     * @param {AdditionalExtractionMethodFormModel} extractionMethod
     */
    $scope.toggleAdditionalExtractionMethod = (extractionMethod) => {
        extractionMethod.expanded = extractionMethod.selected;
        $scope.checkAutocompleteIndexEnabled();
        additionalExtractionPanelToggleHandlers[extractionMethod.method](extractionMethod);
    };

     /**
     * Handles the panel toggle event for the additional extraction method. This is used to do some initialization when the user
     * opens the panel for a specific extraction method.
     * @param {AdditionalExtractionMethodFormModel} extractionMethod
     */
    $scope.onAdditionalExtractionMethodPanelToggle = (extractionMethod) => {
        extractionMethod.toggleCollapse();
        additionalExtractionPanelToggleHandlers[extractionMethod.method](extractionMethod);
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
     * Resolves the hint for the Autocomplete Index not enabled message. This is needed because the hint contains a html link that
     * should be properly rendered.
     * @return {*}
     */
    $scope.getAutocompleteDisabledHelpMessage = () => {
        // The hint contains a html link which should be properly rendered.
        const message = decodeHTML(
            $translate.instant(
                'ttyg.agent.create_agent_modal.form.additional_query_methods.autocomplete_disabled_message',
                {autocompleteIndexPage: '#/autocomplete'}
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
    $scope.cancel = () => {
        $uibModalInstance.dismiss({});
    };

    /**
     * Closes the modal when the user clicks the close button.
     */
    $scope.close = () => {
        $uibModalInstance.dismiss({});
    };

    /**
     * Updates the similarity search panel.
     *
     * @param {boolean} clearIndexSelection - If true, the selected index will be cleared.
     */
    $scope.updateSimilaritySearchPanel = (clearIndexSelection = false) => {
        const similaritySearchExtractionMethod = $scope.agentFormModel.assistantExtractionMethods.getSimilarityExtractionMethod();
        if (!similaritySearchExtractionMethod.selected) {
            return;
        }
        if (clearIndexSelection) {
            similaritySearchExtractionMethod.similarityIndex = null;
        }
        handleSimilaritySearchExtractionMethodPanelToggle(similaritySearchExtractionMethod);
    };

    /**
     * Updates the ChatGPT retrieval connector panel.
     *
     * @param {boolean} clearSelection - If true, the selected connector will be cleared.
     */
    $scope.updateRetrievalConnectorPanel = (clearSelection = false) => {
        const retrievalExtractionExtractionMethod = $scope.agentFormModel.assistantExtractionMethods.getRetrievalExtractionMethod();
        if (!retrievalExtractionExtractionMethod.selected) {
            return;
        }
        if (clearSelection) {
            retrievalExtractionExtractionMethod.retrievalConnectorInstance = null;
        }
        handleRetrievalConnectorExtractionMethodPanelToggle(retrievalExtractionExtractionMethod);
    };

    $scope.checkIfFTSEnabled = () => {
        if (!$scope.agentFormModel.repositoryId) {
            $scope.agentSettingsForm.$setValidity('FTSDisabled', false);
            return;
        }

        const ftsSearchExtractionMethod = $scope.agentFormModel.assistantExtractionMethods.getFTSSearchExtractionMethod();
        if (!ftsSearchExtractionMethod.selected) {
            // clear the validation status if method is deselected.
            $scope.agentSettingsForm.$setValidity('FTSDisabled', true);
            return;
        }

        $scope.extractionMethodLoaderFlags[ExtractionMethod.FTS_SEARCH] = true;

        // pass a fake repository info object with only an id because we don't care for the location
        RepositoriesRestService.getRepositoryModel({id: $scope.agentFormModel.repositoryId}).then((repositoryModel) => {
            $scope.ftsEnabled = repositoryModel.getParamValue(REPOSITORY_PARAMS.enableFtsIndex);
        })
        .catch((error) => {
            logAndShowError(error, 'ttyg.agent.messages.error_repository_config_loading');
        })
        .finally(() => {
            $scope.extractionMethodLoaderFlags[ExtractionMethod.FTS_SEARCH] = false;
            $scope.agentSettingsForm.$setValidity('FTSDisabled', $scope.ftsEnabled);
        });
    };

    /**
     * Handles the change in the repository id field. This is needed because
     * the FTS method configuration depends on the selected repository to be
     * able to validate if the FTS is enabled for that selected repository.
     */
    $scope.onRepositoryChange = () => {
        refreshValidations(true, true);
    };

    /**
     * Checks the status of the autocomplete index.
     */
    $scope.checkAutocompleteIndexEnabled = () => {
        AutocompleteService.checkAutocompleteStatus().then((autocompleteEnabled) => {
            $scope.autocompleteEnabled = autocompleteEnabled;
        }).catch((error) => {
            toastr.error(getError(error));
        });
    }

    /**
     * Restores the default system instructions.
     */
    $scope.onRestoreDefaultSystemInstructions = () => {
        $scope.agentFormModel.instructions.systemInstruction = $scope.agentFormModel.instructions.systemInstructionCopy;
    };

    /**
     * Restores the default user instructions.
     */
    $scope.onRestoreDefaultUserInstructions = () => {
        $scope.agentFormModel.instructions.userInstruction = $scope.agentFormModel.instructions.userInstructionCopy;
    };

    /**
     * Handles the change in the temperature field. This is needed because the high temperature warning should be shown
     * when the temperature is higher than 1.
     */
    $scope.onTemperatureChange = () => {
        $scope.showHighTemperatureWarning = $scope.agentFormModel.temperature.value > 1;
    };

    /**
     * Handles the change in the system instructions field.
     */
    $scope.onSystemInstructionChange = () => {
        if ($scope.agentFormModel.instructions.systemInstruction !== '' && !$scope.showSystemInstructionWarning) {
            $scope.showSystemInstructionWarning = true;
            ModalService.openModalAlert({
                title: $translate.instant('ttyg.agent.create_agent_modal.form.system_instruction.overriding_system_instruction_warning.title'),
                message: $translate.instant('ttyg.agent.create_agent_modal.form.system_instruction.overriding_system_instruction_warning.body')
            }).result
                .then(function () {
                    // Do nothing, just warning the user
                });
        }
        if ($scope.agentFormModel.instructions.systemInstruction === '') {
            $scope.showSystemInstructionWarning = false;
        }
    };

    /**
     * Opens the agent instructions explain modal.
     */
    $scope.onExplainAgentSettings = () => {
      const agentPayload = $scope.agentFormModel.toPayload();
      TTYGService.explainAgentSettings(agentPayload)
          .then((agentInstructionsExplain) => {
            const options = {
                templateUrl: 'js/angular/ttyg/templates/modal/agent-instructions-explain-modal.html',
                controller: 'AgentInstructionsExplainModalController',
                windowClass: 'agent-instructions-explain-modal',
                backdrop: 'static',
                resolve: {
                    dialogModel: function () {
                        return {
                            agentInstructionsExplain
                        };
                    }
                },
                size: 'lg'
            };
            $uibModal.open(options).result
                .then(() => {
                    // Do nothing
                });
          }).catch((error) => {
              toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
          });
    };

    $scope.getSuggestions = (event) => {
        const inputText = event.target.value;
        AutocompleteRestService.getAutocompleteSuggestions(inputText)
            .then(mapUriAsNtripleAutocompleteResponse)
            .then((suggestions) => {
                $scope.autocompleteSuggestions = suggestions.map(item => ({ text: item.value }));
            }).catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
        });
    }

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
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
            .catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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
            .catch((error) => {
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
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

    const handleFTSExtractionMethodPanelToggle = (extractionMethod) => {
        $scope.checkIfFTSEnabled();
    };

    /**
     * Returns the repository info model for the selected repository in the form.
     *
     * @return {{repositoryLocation: (*|undefined), repositoryId: (*|undefined)}}
     */
    const getSelectedRepositoryInfo = () => {
        const selectRepositoryInfo = $scope.activeRepositoryList.find((repository) => repository.value === $scope.agentFormModel.repositoryId);
        return {
            repositoryId: selectRepositoryInfo ? selectRepositoryInfo.data.repository.id : undefined,
            repositoryLocation: selectRepositoryInfo ? selectRepositoryInfo.data.repository.location : undefined
        };
    };

    const handleSimilaritySearchExtractionMethodPanelToggle = (extractionMethod) => {
        if (!extractionMethod.selected) {
            // clear the validation status if method is deselected.
            $scope.agentSettingsForm.$setValidity('missingIndex', true);
        }

        if (extractionMethod.expanded) {
            $scope.extractionMethodLoaderFlags[extractionMethod.method] = true;
            const selectedRepositoryInfo = getSelectedRepositoryInfo();
            SimilarityService.getIndexesAsMenuModel(selectedRepositoryInfo.repositoryId, selectedRepositoryInfo.repositoryLocation)
                .then((indexes) => {
                    $scope.similarityIndexes = indexes;
                    $scope.agentSettingsForm.$setValidity('missingIndex', !extractionMethod.selected || !!(indexes && indexes.length));
                    updateSelectedSimilarityIndex($scope.similarityIndexes, extractionMethod);
                })
                .catch((error) => {
                    $scope.agentSettingsForm.$setValidity('missingIndex', false);
                    logAndShowError(error, 'ttyg.agent.messages.error_similarity_indexes_loading');
                })
                .finally(() => {
                    $scope.extractionMethodLoaderFlags[extractionMethod.method] = false;
                });
        }
    };

    /**
     * Updates the selected similarity index for the extraction method.
     *
     * @param {SelectMenuOptionsModel[]} indexes - The list of all available similarity indexes.
     * @param {Object} extractionMethod - The extraction method object containing the currently selected similarity index.
     */
    const updateSelectedSimilarityIndex = (indexes, extractionMethod) => {
        if (indexes.length === 0) {
            // If no similarity indexes are available, clear the similarity index.
            extractionMethod.similarityIndex = null;
            return;
        }

        // If the selected index is not found in the current list, default to the first index.
        const selectedIndex = indexes.find((index) => index.value === extractionMethod.similarityIndex);
        extractionMethod.similarityIndex = selectedIndex ? selectedIndex.value : indexes[0].value;
    };

    const handleRetrievalConnectorExtractionMethodPanelToggle = (extractionMethod) => {
        if (!extractionMethod.selected) {
            // clear the validation status if method is deselected.
            $scope.agentSettingsForm.$setValidity('missingConnector', true);
        }

        if (extractionMethod.expanded) {
            $scope.extractionMethodLoaderFlags[extractionMethod.method] = true;
            const selectedRepositoryInfo = getSelectedRepositoryInfo();
            ConnectorsService.getConnectorPrefixByName(CHAT_GPT_RETRIEVAL_CONNECTOR_NAME, selectedRepositoryInfo.repositoryId, selectedRepositoryInfo.repositoryLocation)
                .then((prefix) => ConnectorsService.getConnectorsByTypeAsSelectMenuOptions(prefix, selectedRepositoryInfo.repositoryId, selectedRepositoryInfo.repositoryLocation))
                .then((connectors) => {
                    $scope.retrievalConnectors = connectors;
                    $scope.agentSettingsForm.$setValidity('missingConnector', !extractionMethod.selected || !!(connectors && connectors.length));
                    updateSelectedRetrievalConnector($scope.retrievalConnectors, extractionMethod);

                })
                .catch((error) => {
                    $scope.agentSettingsForm.$setValidity('missingConnector', false);
                    logAndShowError(error, 'ttyg.agent.messages.error_retrieval_connectors_loading');
                })
                .finally(() => {
                    $scope.extractionMethodLoaderFlags[extractionMethod.method] = false;
                });
        }
    };

    /**
     * Updates the selected retrieval connector for the extraction method.
     *
     * @param {SelectMenuOptionsModel[]} retrievalConnectors - The list of all available connectors.
     * @param {Object} extractionMethod - The extraction method object containing the currently selected retrieval connector.
     */
    const updateSelectedRetrievalConnector = (retrievalConnectors, extractionMethod) => {
        if (retrievalConnectors.length === 0) {
            // If no connector are available, clear the similarity index.
            extractionMethod.retrievalConnectorInstance = null;
            return;
        }
        const selectedConnector = retrievalConnectors.find((connector) => connector.value === extractionMethod.retrievalConnectorInstance);

        // If the selected connector is not found in the current list, default to the first index.
        extractionMethod.retrievalConnectorInstance = selectedConnector
            ? selectedConnector.value
            : retrievalConnectors[0].value;
    };

    const extractionPanelToggleHandlers = {
        [ExtractionMethod.FTS_SEARCH]: (extractionMethod) => handleFTSExtractionMethodPanelToggle(extractionMethod),
        [ExtractionMethod.SPARQL]: (extractionMethod) => {},
        [ExtractionMethod.SIMILARITY]: (extractionMethod) => handleSimilaritySearchExtractionMethodPanelToggle(extractionMethod),
        [ExtractionMethod.RETRIEVAL]: (extractionMethod) => handleRetrievalConnectorExtractionMethodPanelToggle(extractionMethod)
    };

    const additionalExtractionPanelToggleHandlers = {
        [AdditionalExtractionMethod.AUTOCOMPLETE_IRI_DISCOVERY_SEARCH]: (extractionMethod) => handleAutocompleteExtractionMethodPanelToggle(extractionMethod),
        [AdditionalExtractionMethod.IRI_DISCOVERY_SEARCH]: () => {},
    };

    const handleAutocompleteExtractionMethodPanelToggle = () => {
        $scope.checkAutocompleteIndexEnabled();
    }

    const refreshValidations = (clearIndexSelection = false, clearRetrievalConnectorSelection = false) => {
        $scope.checkIfFTSEnabled();
        $scope.updateSimilaritySearchPanel(clearIndexSelection);
        $scope.updateRetrievalConnectorPanel(clearRetrievalConnectorSelection);
        $scope.checkAutocompleteIndexEnabled();
    };

    const onTabVisibilityChanged = () => {
        if (!document.hidden) {
            refreshValidations();
        }
    };

    // =========================
    // Subscriptions
    // =========================

    const removeAllSubscribers = () => {
        document.removeEventListener("visibilitychange", onTabVisibilityChanged);
    };

    document.addEventListener("visibilitychange", onTabVisibilityChanged);

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', removeAllSubscribers);


    // =========================
    // Initialization
    // =========================

    const init = () => {
        // Delay the validation status setting because angular form ngmodel is not present immediately
        setTimeout(setExtractionMethodValidityStatus, 0);
    };
    init();
}
