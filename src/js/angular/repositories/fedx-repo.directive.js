import {getFileName} from "./controllers";
import {repository} from "d3/build/package";

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

    function linkFunc($scope, $element, $attrs) {
        $scope.getConfig(`fedx`);
        $scope.intOptionsLabels = {enforceMaxQueryTime: 'Query timeout (seconds)', boundJoinBlockSize: 'Bound join block size', joinWorkerThreads: 'Join worker threads', leftJoinWorkerThreads: 'Left join worker threads', unionWorkerThreads: 'Union worker threads'};
        $scope.optionsOfTypeInt = Object.keys($scope.intOptionsLabels);

        $scope.boolOptionsLabels =
            {includeInferredDefault: 'Include inferred default', enableServiceAsBoundJoin: 'Enable SERVICE as bound join', isLogQueries: 'Log queries', debugQueryPlan: 'Debug query plan', isLogQueryPlan: 'Log query plan'};
        $scope.optionsOfTypeBool = Object.keys($scope.boolOptionsLabels);

        $scope.fedxMembersNum = 0;

        $scope.getMembers= function () {
            return $scope.fedxMembersNum;
        }
        $scope.hidden = false;
        $scope.addMember = function (repositoryId, repositoryType) {
            $scope.fedxMembersNum++;
            document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.alert').setAttribute("style", "display:none;");
            document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').setAttribute("style", "display:block;");
            $scope.refresh(repositoryId, repositoryType);
        }
        $scope.hidden = false;

        $scope.getRepoIdDOMIndex = function(repositoryId) {
            var elements = Array.from(document.querySelector('.pt-1').querySelector('.form-local-repos').childNodes);
            var elIndex = -1;
            for (let i = 0; i < elements.length; ++i) {
                if (elements[i].id === repositoryId) {
                    elIndex = i;
                    break;
                }
            }
            return elIndex;
        }

        $scope.getRepoЕlement = function(repositoryId) {
            var elements = Array.from(document.querySelector('.pt-1').querySelector('.form-local-repos').childNodes);
            var index = $scope.getRepoIdDOMIndex(repositoryId);
            var aElements = elements[index].childNodes;
            var elIndex = -1;
            for (let i = 0; i < elements.length; ++i) {
                if (aElements[i].id === repositoryId + "-a") {
                    elIndex = i;
                    break;
                }
            }
            return aElements[elIndex];
        }

        $scope.refresh = function(repositoryId, repositoryType) {
            var repoMembers = document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').querySelector('.tbody-fedx');
            var newMemberTr = document.createElement('tr');
            newMemberTr.id = repositoryId;
            newMemberTr.className = "repository";
            var td = document.createElement('td');

            var editBtn = document.createElement("btn");
            editBtn.setAttribute("class", "btn btn-link p-0 edit-repository-btn");
            var editIcon = document.createElement("span");
            editIcon.setAttribute("class", "icon-edit");
            editBtn.appendChild(editIcon);
            editBtn.style.float = "right";

            var closeBtn = document.createElement('btn');
            closeBtn.setAttribute("class", "btn btn-link p-0 secondary");
            var closeIcon = document.createElement("span");
            closeIcon.setAttribute("class", "icon-close");
            closeBtn.style.float = "right";
            closeBtn.appendChild(closeIcon);

            var writableBtn = document.createElement('btn');
            writableBtn.setAttribute("class", "btn btn-link p-0 secondary");

            // workaround
            writableBtn.id=repositoryId + "-toWrite";
            // workaround

            var writableIcon = document.createElement("span");
            writableIcon.setAttribute("class", "icon-import");
            writableIcon.id=repositoryId + "-icon";
            writableBtn.style.float = "right";

            if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint') {
                var elIndex = $scope.getRepoIdDOMIndex(repositoryId);
                var nodeToDel;
                if (elIndex !== -1) {
                    nodeToDel = document.querySelector('.pt-1').querySelector('.form-local-repos').childNodes.item(elIndex);
                    document.querySelector('.pt-1').querySelector('.form-local-repos').removeChild(nodeToDel);
                }
            }

            var nodeToAdd = document.createElement('div');
            nodeToAdd.setAttribute("id", repositoryId);
            nodeToAdd.setAttribute("style", "display:block");
            nodeToAdd.setAttribute("class", "fedXMember ng-scope");
            var nodeSpan = document.createElement('span');
            nodeSpan.setAttribute("className", "multiline-text ng-binding");
            if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint') {
                nodeSpan.setAttribute("class", "icon-repo-" + repositoryType);
            } else {
                nodeSpan.setAttribute("class", "icon-link")
            }
            nodeSpan.innerHTML = repositoryId;
            nodeToAdd.appendChild(nodeSpan);

            closeBtn.addEventListener('click', (event) => {
                if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint') {
                    document.querySelector('.pt-1').querySelector('.form-local-repos').appendChild(nodeToDel);
                }
                repoMembers.removeChild(newMemberTr);
                if (nodeToAdd.id === $scope.writableRepository) {
                    $scope.writableRepository = null;
                }
                $scope.fedxMembersNum--;

                if ($scope.fedxMembersNum === 0) {
                    document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.alert').setAttribute("style", "display:block");
                    document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').setAttribute("style", "display:none;");
                }
            })

            editBtn.addEventListener('click', (event) => {
                if (repositoryType === 'graphdb-server' || repositoryType === 'sparql-endpoint') {
                    $scope.editFedXRepository(repositoryType);
                } else {
                    $scope.editLocalFedXRepository()
                }
            })
            writableBtn.addEventListener('click', (event) => {
                if ($scope.writableRepository) {
                    var currWritableId = $scope.writableRepository;
                    document.getElementById(currWritableId + "-icon").removeAttribute('style');
                    // var newWritableIcon = document.createElement("span");
                    // newWritableIcon.setAttribute("class", "icon-import");
                    // currBtn.appendChild(newWritableIcon);
                    // currBtn.removeChild(currBtn.firstChild);
                    // $scope.writableRepository.childNodes[1].replaceChild(newWritableIcon, $scope.writableRepository.childNodes[1].firstChild)
                }

                writableIcon.style.color="#11b0a1";
                $scope.writableRepository = repositoryId;
            })

            writableBtn.appendChild(writableIcon);
            nodeToAdd.appendChild(writableBtn);
            nodeToAdd.appendChild(closeBtn);
            nodeToAdd.appendChild(editBtn);

            td.appendChild(nodeToAdd);

            newMemberTr.appendChild(td);
            repoMembers.appendChild(newMemberTr);
        }

        $scope.addFedXRepository = function () {
            $scope.model = {
                'editRepoPage': false,
                'repoid' : "",
                'serverurl' : "",
                'sparqlendpoint' : ""

            }
            $scope.remote_repo_type = 'graphdb-server';
            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
            });
        };

        $scope.editLocalFedXRepository = function () {
            $scope.access_rights = "respect_access";

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/edit-fedx-local-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
            });
        };

        $scope.editFedXRepository = function (repositoryType) {
            $scope.model = {
                'editRepoPage': true,
                'repoid' : $scope.repoid,
                'serverurl' : $scope.serverurl,
                'sparqlendpoint' : $scope.sparqlendpoint
            }
            $scope.remote_repo_type = repositoryType;

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
            });
        };

        $scope.cancel = function () {
            $scope.$modalInstance.dismiss('cancel');
        };
        $scope.ok = function () {
            $scope.$modalInstance.close();
            var serverUrl = document.querySelector('#addFedXRepositoryForm').querySelector('#server-url').value
            var repoId = document.querySelector('#addFedXRepositoryForm').querySelector('#repository-id').value
            var endpointUrl = document.querySelector('#addFedXRepositoryForm').querySelector('#url-endpoint').value
            if (serverUrl && repoId) {
                $scope.repoid = repoId;
                $scope.serverurl = serverUrl;
                $scope.addMember(repoId + '@' + serverUrl, 'graphdb-server');
            } else {
                $scope.sparqlendpoint = endpointUrl;
                $scope.addMember(endpointUrl, 'sparql-endpoint');
            }
        };
    }
}
