import 'angular/core/directives/core-error/core-error.directive';

const modules = [
    'toastr',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.core.directives.core-error'
];

angular
    .module('graphdb.framework.chatgpt.controllers', modules)
    .controller('ChatGptCtrl', ChatGptCtrl)
    .controller('ChatGptSettingsCtrl', ChatGptSettingsCtrl);

ChatGptCtrl.$inject = ['$scope', '$http', '$timeout', '$translate', '$uibModal', '$repositories', 'toastr', 'ModalService', 'LocalStorageAdapter'];

const CHATGPTRETRIEVAL_ENDPOINT = 'rest/chat/retrieval';

function ChatGptCtrl($scope, $http, $timeout, $translate, $uibModal, $repositories, toastr, ModalService, LocalStorageAdapter) {
    function scrollToEnd() {
        $timeout(() => {
            const element = document.getElementById("messages-scrollable");
            element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }, 0);
    }

    function init() {
        $scope.history = [];
        $scope.askSettings = {
            "queryTemplate": {
                "query": "string"
            },
            "groundTruths": [],
            "echoVectorQuery": false,
            "topK": 5
        };

        const stored = LocalStorageAdapter.get('ttyg');
        const repoId = $repositories.getActiveRepository();
        if (stored && stored[repoId]) {
            const s = stored[repoId];
            if (s.history) {
                $scope.history = s.history;
            }
            $scope.connectorID = s.connectorID;
            if (s.askSettings) {
                $scope.askSettings = s.askSettings;
            }
        }

        scrollToEnd();
    }

    function persist() {
        const persisted = LocalStorageAdapter.get('ttyg') || {};
        persisted[$repositories.getActiveRepository()] = {
            "history": $scope.history,
            "connectorID": $scope.connectorID,
            "askSettings": $scope.askSettings
        };
        LocalStorageAdapter.set('ttyg', persisted);
    }

    $scope.helpTemplateUrl = "js/angular/chatgpt/templates/chatInfo.html";

    $scope.getIcon = function (role) {
        if (role === "question") {
            return "user";
        } else if (role === "assistant") {
            return "data";
        } else {
            return "help";
        }
    };

    $scope.ask = function () {
        if (!$scope.question.trim()) {
            return;
        }

        const filteredHistory = $scope.history.filter((h) => !h.error);
        const chatRequest = {
            "connectorID": $scope.connectorID,
            "question": $scope.question,
            "askSettings": $scope.askSettings,
            "history": filteredHistory
        };

        const questionMsg = {"role": "question", "content": $scope.question};

        $http.post(`${CHATGPTRETRIEVAL_ENDPOINT}?repositoryID=${$repositories.getActiveRepository()}`, chatRequest).then((response) => {
            $scope.history.pop();
            response.data.forEach((e) => $scope.history.push(e));
        }).catch((error) => {
            questionMsg.error = true;
            toastr.error(getError(error, 0, 100));
        }).finally(() => {
            $scope.loader = false;
            scrollToEnd();
            persist();
        });

        $scope.history.push(questionMsg);
        $scope.loader = true;
        scrollToEnd();
        $scope.question = "";
    };

    $scope.clear = function () {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: $translate.instant('ttyg.clear.history.confirmation'),
            warning: true
        }).result
            .then(function () {
                $scope.history = [];
                persist();
            });
    };

    $scope.openSettings = function () {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/chatgpt/templates/modal/settings.html',
            controller: 'ChatGptSettingsCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        askSettings: $scope.askSettings,
                        connectorID: $scope.connectorID
                    };
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.connectorID = result.connectorID;
            $scope.askSettings = result.askSettings;
            persist();
        });
    };

    $scope.$on('repositoryIsSet', function () {
        init();
    });

    if ($repositories.getActiveRepository()) {
        init();
    }
}

ChatGptSettingsCtrl.$inject = ['$scope', '$translate', '$uibModalInstance', 'data'];

function ChatGptSettingsCtrl($scope, $translate, $uibModalInstance, data) {
    $scope.dialogTitle = $translate.instant('ttyg.settings.title');

    $scope.save = function () {
        if ($scope.form.$valid) {
            const askSettings = {
                queryTemplate: JSON.parse($scope.queryTemplate),
                groundTruths: $scope.groundTruths.split("\n"),
                topK: $scope.topK,
                echoVectorQuery: $scope.echoVectorQuery
            };
            $uibModalInstance.close({
                askSettings,
                connectorID: $scope.connectorID
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.connectorID = data.connectorID;
    $scope.queryTemplate = JSON.stringify(data.askSettings.queryTemplate, null, '  ');
    $scope.topK = data.askSettings.topK;
    $scope.echoVectorQuery = data.askSettings.echoVectorQuery;
    $scope.groundTruths = data.askSettings.groundTruths
        .map((s) => s.trim())
        .filter((s) => s !== '')
        .join("\n");
}
