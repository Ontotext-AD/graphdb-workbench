import '../../core/services/graphql.service';
import '../services/graphql-context.service';
import {
    ConfigureEndpointStep,
    GenerateEndpointStep,
    SelectSchemaSourceStep
} from "../../models/graphql/create-endpoint-wizard-steps";
import {endpointUrl} from "../models/endpoints";
import {Wizard} from "../../models/graphql/wizard";
import 'angular/graphql/directives/select-schema-sources.directive';
import 'angular/graphql/directives/configure-endpoint.directive';
import 'angular/graphql/directives/generate-endpoint.directive';
import {GraphqlEventName} from "../services/graphql-context.service";
import {GraphqlEndpointConfiguration} from "../../models/graphql/graphql-endpoint-configuration";

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.graphql.services.graphql-context',
    'graphdb.framework.graphql.directives.select-schema-sources',
    'graphdb.framework.graphql.directives.configure-endpoint',
    'graphdb.framework.graphql.directives.generate-endpoint'
];

angular
    .module('graphdb.framework.graphql.controllers.create-graphql-endpoint-view', modules)
    .controller('CreateGraphqlEndpointViewCtrl', CreateGraphqlEndpointViewCtrl);

CreateGraphqlEndpointViewCtrl.$inject = ['$scope', '$location', '$repositories', '$translate', 'ModalService', 'toastr', 'GraphqlService', 'GraphqlContextService'];

function CreateGraphqlEndpointViewCtrl($scope, $location, $repositories, $translate, ModalService, toastr, GraphqlService, GraphqlContextService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

    /**
     * The source repositories select menu model.
     * @type {SelectMenuOptionsModel[]}
     */
    $scope.sourceRepositories = [];

    /**
     * The selected source repository.
     * @type {SelectMenuOptionsModel|undefined}
     */
    $scope.selectedSourceRepository = undefined;

    /**
     * The previous selected source repository is same as the selected source repository when the view is initialized.
     * It is used to restore the selected source repository when the user cancels the source repository change.
     * @type {SelectMenuOptionsModel|undefined}
     */
    $scope.previousSelectedSourceRepository = undefined;

    /**
     * The create endpoint wizard model.
     * @type {Wizard|undefined}
     */
    $scope.wizardModel = undefined;

    /**
     * Current wizard step model.
     * @type {WizardStep|undefined}
     */
    $scope.currentStep = undefined;

    // =========================
    // Public methods
    // =========================

    /**
     * Handles the change of the selected source repository.
     * @param {SelectMenuOptionsModel} selectedRepository The selected source repository.
     */
    $scope.onSelectedSourceRepositoryChange = (selectedRepository) => {
        ModalService.openConfirmationModal({
                title: $translate.instant('graphql.create_endpoint.messages.source_repository_changed.title'),
                message: $translate.instant('graphql.create_endpoint.messages.source_repository_changed.body'),
                confirmButtonKey: 'common.confirm'
            },
            () => {
                $scope.previousSelectedSourceRepository = $scope.selectedSourceRepository;
                GraphqlContextService.updateSourceRepository(selectedRepository.value);
            },
            () => {
                $scope.selectedSourceRepository = $scope.previousSelectedSourceRepository;
            });
    };

    /**
     * Activates the wizard step.
     * @param {WizardStep} step
     */
    $scope.activateStep = (step) => {
        $scope.wizardModel.setStepActive(step);
        setCurrentStep(step);
    };

    // =========================
    // Private methods
    // =========================

    const onGenerateEndpoint = (endpoint) => {
        // TODO: Implement endpoint generation
    };

    /**
     * Handles the returning to the previous step in the create endpoint wizard.
     */
    const onPreviousEndpointCreationStep = () => {
        setCurrentStep($scope.wizardModel.previousStep());
    };

    /**
     * Handles the transition to the next step in the create endpoint wizard.
     */
    const onNextEndpointCreationStep = () => {
        setCurrentStep($scope.wizardModel.nextStep());
    };

    /**
     * Handles the termination of the create endpoint wizard.
     */
    const onCancelEndpointCreation = () => {
        $location.path(endpointUrl.ENDPOINT_MANAGEMENT);
    };

    /**
     * Sets the current step in the create endpoint wizard.
     * @param {WizardStep} step The current step.
     */
    const setCurrentStep = (step) => {
        $scope.currentStep = step;
    };

    /**
     * Handles the change of the active repository.
     * @param {object} repositoryObject
     */
    const getActiveRepositoryObjectHandler = (repositoryObject) => {
        if (repositoryObject) {
            onInit();
        }
    };

    /**
     * Loads all repository objects and sets the selected source repository to be the same as the active repository.
     */
    const setupSourceRepositories = () => {
        $scope.sourceRepositories = $repositories.getRepositoriesAsSelectMenuOptions(
            () => $repositories.getLocalReadableGraphdbRepositories()
        );
        const activeRepository = $repositories.getActiveRepository();
        $scope.selectedSourceRepository = $scope.sourceRepositories
            .find((repo) => repo.value === activeRepository);
        GraphqlContextService.updateSourceRepository($scope.selectedSourceRepository.value);
        $scope.previousSelectedSourceRepository = $scope.selectedSourceRepository;
    };

    /**
     * Initializes the create endpoint wizard with the steps.
     */
    const setupWizard = () => {
        $scope.wizardModel = new Wizard()
            .addStep(new SelectSchemaSourceStep())
            .addStep(new ConfigureEndpointStep())
            .addStep(new GenerateEndpointStep());
        setCurrentStep($scope.wizardModel.getActiveStep());
    };

    /**
     * Unsubscribes all watchers.
     */
    const unsubscribeAll = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Subscriptions
    // =========================

    subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.GENERATE_ENDPOINT, onGenerateEndpoint));
    subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.PREVIOUS_ENDPOINT_CREATION_STEP, onPreviousEndpointCreationStep));
    subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.NEXT_ENDPOINT_CREATION_STEP, onNextEndpointCreationStep));
    subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.CANCEL_ENDPOINT_CREATION, onCancelEndpointCreation));
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler));
    $scope.$on('$destroy', unsubscribeAll);

    // =========================
    // Initialization
    // =========================

    const onInit = () => {
        // Reinitialize the wizard only if the source repository is not selected. From this point on, the wizard will
        // be reinitialized only when the user changes the source repository.
        if (!$scope.selectedSourceRepository) {
            GraphqlContextService.createEndpointConfig(new GraphqlEndpointConfiguration());
            setupWizard();
            setupSourceRepositories();
        }
    };
}
