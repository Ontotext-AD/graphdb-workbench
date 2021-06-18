import {getFileName} from "./controllers";

angular
    .module('graphdb.framework.repositories.fedx-repo.directive', [])
    .directive('fedxRepo', fedxRepoDirective);

fedxRepoDirective.$inject = ['$modal', 'RepositoriesRestService','toastr'];

function fedxRepoDirective($modal, RepositoriesRestService, toastr) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'js/angular/repositories/templates/fedx-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {
        $scope.getConfig(`fedx`);
        $scope.intOptionsLabels = {enforceMaxQueryTime: 'Query timeout (seconds)', boundJoinBlockSize: 'Bound join block size', joinWorkerThreads: 'Join worker threads', leftJoinWorkerThreads: 'Left join worker threads', unionWorkerThreads: 'Union worker threads'};
        $scope.optionsOfTypeInt = Object.keys($scope.intOptionsLabels);

        $scope.boolOptionsLabels =
            {includeInferredDefault: 'Include inferred default', enableServiceAsBoundJoin: 'Enable SERVICE as bound join', isLogQueries: 'Log queries', debugQueryPlan: 'Debug query plan', isLogQueryPlan: 'Log query plan'};
        $scope.optionsOfTypeBool = Object.keys($scope.boolOptionsLabels);

        $scope.fedxMembers = [];

        $scope.getMembers= function () {
            return $scope.fedxMembers;
        }

        $scope.addMember = function (repositoryId) {
            $scope.fedxMembers.push(repositoryId);
            $scope.refresh(repositoryId);
        }

        $scope.refresh = function(repositoryId) {
            var repoMembers = document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table');
            var newMemberTr = document.createElement('tr');
            newMemberTr.id=repositoryId;
            var td = document.createElement('td');
            var text1 = document.createTextNode(repositoryId);
            td.appendChild(text1);
            newMemberTr.appendChild(td);
            repoMembers.appendChild(newMemberTr);
            document.querySelector('.pt-1').querySelector('.form-local-repos')
        }
        // $scope.refresh();
    }
}
