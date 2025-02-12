import 'angular/core/directives/shuttle-multiselect/shuttle-multiselect.directive';
import {GraphListOptions} from "../../models/graphs/graph-list-options";
import {GraphqlEventName} from "../services/graphql-context.service";
import {OntologyShaclShapeSource, SchemaSourceType} from "../../models/graphql/create-endpoint-wizard-steps";

const modules = [
    'graphdb.framework.core.directives.shuttle-multiselect'
]

angular
    .module('graphdb.framework.graphql.directives.select-schema-sources', modules)
    .directive('selectSchemaSources', SelectSchemaSourcesComponent);

SelectSchemaSourcesComponent.$inject = ['ModalService', '$translate', 'toastr', '$repositories', 'GraphqlContextService', 'GraphqlService', 'RDF4JRepositoriesService'];

function SelectSchemaSourcesComponent(ModalService, $translate, toastr, $repositories, GraphqlContextService, GraphqlService, RDF4JRepositoriesService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/step-select-schema-sources.html',
        scope: {
            stepDefinition: '='
        },
        link: ($scope, element) => {

            // =========================
            // Private variables
            // =========================

            const subscriptions = [];

            // =========================
            // Public variables
            // =========================

            $scope.schemaSourceType = SchemaSourceType;
            $scope.ontologyShaclShapeSource = OntologyShaclShapeSource;

            /**
             * The label keys for the shacl shapes multiselect component.
             */
            $scope.shapesMultiselectLabels = {
                availableOptionsTitle: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.available_options.title',
                availableOptionsFilter: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.available_options.filter_placeholder',
                selectedOptionsTitle: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.selected_options.title',
                selectedOptionsCount: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.selected_options.count',
                selectTooltip: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.add.tooltip',
                selectAllLabel: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.add_all.label',
                selectAllTooltip: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.add_all.tooltip',
                deselectTooltip: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.remove.tooltip',
                deselectAllLabel: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.remove_all.label',
                deselectAllTooltip: 'graphql.create_endpoint.wizard_steps.shapes_multiselect.actions.remove_all.tooltip'
            };

            /**
             * The label keys for the graphs multiselect component.
             */
            $scope.graphsMultiselectLabels = {
                availableOptionsTitle: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.available_options.title',
                availableOptionsFilter: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.available_options.filter_placeholder',
                selectedOptionsTitle: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.selected_options.title',
                selectedOptionsCount: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.selected_options.count',
                selectTooltip: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.add.tooltip',
                selectAllLabel: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.add_all.label',
                selectAllTooltip: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.add_all.tooltip',
                deselectTooltip: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.remove.tooltip',
                deselectAllLabel: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.remove_all.label',
                deselectAllTooltip: 'graphql.create_endpoint.wizard_steps.graphs_multiselect.actions.remove_all.tooltip'
            }

            /**
             * The endpoint configuration model.
             * @type {GraphqlEndpointConfiguration|undefined}
             */
            $scope.endpointConfiguration = undefined

            /**
             * A list of prefixes available for the endpoint
             * @type {SelectMenuOptionsModel[]}
             */
            $scope.prefixList = [];

            /**
             * Flag indicating whether the prefixes are being loaded.
             * @type {boolean}
             */
            $scope.loadingPrefixes = false;

            /**
             * The list of graphs in the repository.
             * @type {GraphListOptions|undefined}
             */
            $scope.graphs = undefined;

            /**
             * The list of SHACL shape graphs in the repository.
             * @type {GraphListOptions|undefined}
             */
            $scope.shaclShapeGraphs = undefined;

            /**
             * The list of GraphQL schema shapes in the repository. The graphql shapes multiselect component uses this
             * list.
             * @type {GraphqlSchemaShapes|undefined}
             */
            $scope.graphqlSchemaShapes = undefined;

            /**
             * The list of all graphs in the repository. The graphs multiselect component uses this list.
             * @type {GraphListOptions|undefined}
             */
            $scope.allGraphs = undefined;

            /**
             * Flag indicating whether the graphs are being loaded.
             * @type {boolean}
             */
            $scope.loadingGraphs = false;

            // =========================
            // Public functions
            // =========================

            /**
             * Handles the termination of the create endpoint wizard.
             */
            $scope.cancel = () => {
                const title = $translate.instant('graphql.create_endpoint.wizard_steps.actions.cancel.confirmation.title');
                const confirmDeleteMessage = $translate.instant('graphql.create_endpoint.wizard_steps.actions.cancel.confirmation.body');
                ModalService.openConfirmation(title, confirmDeleteMessage, () => {
                    GraphqlContextService.cancelEndpointCreation();
                });
            };

            /**
             * Handles the transition to the next step in the create endpoint wizard.
             */
            $scope.next = () => {
                GraphqlContextService.nextEndpointCreationStep();
            };

            /**
             * Handles the switch between schema source types in the UI. Switching schema source types renders different
             * UI components for selecting the schema source and uses different data models.
             */
            $scope.onSchemaSourceTypeChange = () => {
                $scope.endpointConfiguration.schemaSourceType = $scope.stepDefinition.schemaSourceType;
                if ($scope.stepDefinition.schemaSourceType === SchemaSourceType.SHACL_SHAPES) {
                    if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.USE_ALL_GRAPHS) {
                        $scope.endpointConfiguration.selectedGraphs = $scope.allGraphs;
                    } else if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.USE_SHACL_SHAPE_GRAPH) {
                        $scope.endpointConfiguration.selectedGraphs = $scope.shaclShapeGraphs;
                    } else if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.PICK_GRAPHS) {
                        $scope.endpointConfiguration.selectedGraphs = new GraphListOptions();
                    }
                }
            };

            /**
             * Handles the switch between ontology and SHACL shape sources in the UI. Switching between sources changes
             * the list of graphs available for selection.
             */
            $scope.onOntologyShaclShapeSourceChange = () => {
                $scope.endpointConfiguration.owlOrShaclSourceType = $scope.stepDefinition.ontotlogyShaclShapeSource;
                if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.USE_ALL_GRAPHS) {
                    $scope.endpointConfiguration.selectedGraphs = $scope.allGraphs;
                } else if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.USE_SHACL_SHAPE_GRAPH) {
                    $scope.endpointConfiguration.selectedGraphs = $scope.shaclShapeGraphs;
                } else if ($scope.stepDefinition.ontotlogyShaclShapeSource === OntologyShaclShapeSource.PICK_GRAPHS) {
                    $scope.endpointConfiguration.selectedGraphs = new GraphListOptions();
                }
            };

            /**
             * Handles the transition to the next step in the create endpoint wizard.
             * @returns {boolean}
             */
            $scope.canProceed = () => {
                let canProceed = false;
                if ($scope.endpointConfiguration) {
                    const hasSelectedShapes = $scope.endpointConfiguration.hasSelectedGraphqlSchemaShapes();
                    const hasValidEndpointParameters = $scope.endpointParamsForm.$valid;
                    // The first option (radiobutton) allows the user to select graphql shapes.
                    if ($scope.stepDefinition.schemaSourceType === SchemaSourceType.GRAPHQL_SCHEMA_SHAPES && hasSelectedShapes) {
                        canProceed = true;
                    }
                    // The second option (radiobutton) allows the user to select graphs: all graphs, shacl shape graph or
                    // manually pick graphs.
                    // Here the user must also fill in the endpoint parameters form.
                    else if ($scope.stepDefinition.schemaSourceType === SchemaSourceType.SHACL_SHAPES && hasValidEndpointParameters) {
                        // In case the user selects all graphs, we don't care how many graphs are there. We use all
                        // the data in the repository. Also, it's possible that there are no other graphs in the
                        // repository than the default one.
                        if ($scope.endpointConfiguration.owlOrShaclSourceType === OntologyShaclShapeSource.USE_ALL_GRAPHS) {
                            canProceed = true;
                        } else {
                            // In all the other cases there must be at least one graph selected.
                            canProceed = $scope.endpointConfiguration.hasSelectedGraphs();
                        }
                    }
                }
                return canProceed;
            }

            // =========================
            // Private functions
            // =========================

            /**
             * Loads prefixes available in the source repository.
             * @returns {Promise<void>}
             */
            const loadPrefixes = () => {
                $scope.loadingPrefixes = true;
                return GraphqlService.getPrefixListAsSelectOptions(GraphqlContextService.getSourceRepository())
                    .catch((error) => {
                        console.error('Error loading prefixes', error);
                        toastr.error(getError(error));
                    })
                    .finally(() => {
                        $scope.loadingPrefixes = false;
                    });
            }

            /**
             * Loads all graphs available in the source repository.
             * @returns {Promise<GraphListOptions>}
             */
            const loadAllGraphs = () => {
                $scope.loadingGraphs = true;
                return RDF4JRepositoriesService.getGraphs(GraphqlContextService.getSourceRepository())
                    .catch((error) => {
                        console.error('Error loading graphs', error);
                        toastr.error(getError(error));
                    })
                    .finally(() => {
                        $scope.loadingGraphs = false;
                    });
            }

            /**
             * Loads the GraphQL schema shapes from the source repository.
             * @returns {Promise<GraphqlSchemaShapes>}
             */
            const loadGraphqlSchemaShapes = () => {
                return GraphqlService.getGraphqlSchemaShapes(GraphqlContextService.getSourceRepository())
                    .catch((error) => {
                        console.error('Error loading GraphQL schema shapes', error);
                        toastr.error(getError(error));
                    });
            };

            /**
             * Loads the SHACL shape graphs from the source repository.
             * @returns {Promise<GraphListOptions>}
             */
            const loadShaclShapeGraphs = () => {
                return GraphqlService.getShaclShapeGraphs(GraphqlContextService.getSourceRepository())
                    .catch((error) => {
                        console.error('Error loading SHACL shape graphs', error);
                        toastr.error(getError(error));
                    });
            }

            /**
             * Handles the update of the endpoint configuration model.
             * @param {GraphqlEndpointConfiguration} endpointConfiguration The updated endpoint configuration model.
             */
            const loadData = (endpointConfiguration) => {
                $scope.loadingData = true;
                Promise.all([loadPrefixes(), loadAllGraphs(), loadGraphqlSchemaShapes(), loadShaclShapeGraphs()])
                    .then(([prefixes, graphs, graphqlShapes, shaclShapeGraphs]) => {
                        $scope.graphqlSchemaShapes = graphqlShapes;
                        $scope.graphs = graphs;
                        $scope.shaclShapeGraphs = shaclShapeGraphs;
                        $scope.allGraphs = new GraphListOptions([...graphs.graphList, ...shaclShapeGraphs.graphList]);
                        $scope.prefixList = prefixes;
                        $scope.endpointConfiguration = endpointConfiguration;
                    })
                    .finally(() => {
                        $scope.loadingData = false;
                    });
            }

            /**
             * Handles the update of the source repository.
             */
            const onSourceRepositoryUpdated = () => {
                loadData(GraphqlContextService.getNewEndpoint());
            }

            // =========================
            // Subscriptions
            // =========================

            const onDestroy = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            const subscribeToEvents = () => {
                $scope.$on('$destroy', onDestroy);
                subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.SOURCE_REPOSITORY_UPDATED, onSourceRepositoryUpdated));
                const newEndpoint = GraphqlContextService.getNewEndpoint();
                if (!newEndpoint) {
                    subscriptions.push(GraphqlContextService.onEndpointConfigCreated(loadData));
                } else {
                    loadData(newEndpoint);
                }
            }

            const onInit = () => {
                subscribeToEvents();
            }
            onInit();
        }
    };
}
