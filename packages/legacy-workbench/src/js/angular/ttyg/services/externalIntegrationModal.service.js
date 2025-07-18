import 'angular/ttyg/controllers/external-integration-configuration-modal.controller';
import {TTYG_ERROR_MSG_LENGTH} from "./constants";

angular
    .module('graphdb.framework.ttyg.services.externalIntegrationModal',
        ['graphdb.framework.ttyg.controllers.external-integration-configuration-modal'])
    .factory('ExternalIntegrationModalService', ExternalIntegrationModalService)

ExternalIntegrationModalService.$inject = ['$uibModal', 'LocationsRestService', 'toastr'];

function ExternalIntegrationModalService($uibModal, LocationsRestService, toastr) {
    function buildDialogModel(agent, baseUrl) {
        return {
            agentName: agent.name,
            agentId: agent.id,
            queryMethodsUrl: `${baseUrl}/rest/llm/tool/ttyg/${agent.id}`,
            difyExtensionUrl: `${baseUrl}/rest/llm/ttyg/${agent.id}/dify`
        };
    }

    function open(agent) {
        return LocationsRestService.getExternalUrl()
            .then((response) => {
                const dialogModel = buildDialogModel(agent, response.data);

                return $uibModal.open({
                    templateUrl: 'js/angular/ttyg/templates/modal/external-integration-configuration-modal.html',
                    controller: 'ExternalIntegrationConfigurationModalController',
                    windowClass: 'external-integration-configuration-modal',
                    backdrop: 'static',
                    resolve: {
                        dialogModel: () => dialogModel
                    }
                }).result
                    .then(() => {
                        // Modal was closed with success - do nothing
                    })
                    .catch(() => {
                        // Modal was dismissed — do nothing
                    });
            })
            .catch((error) => {
                // Catches API failure
                toastr.error(getError(error, 0, TTYG_ERROR_MSG_LENGTH));
            });
    }

    return {open};
}
