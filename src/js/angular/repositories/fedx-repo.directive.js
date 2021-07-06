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
        $scope.intOptionsLabels = {enforceMaxQueryTime: 'Query timeout (seconds)', boundJoinBlockSize: 'Bound join block size', joinWorkerThreads: 'Join worker threads', leftJoinWorkerThreads: 'Left join worker threads', unionWorkerThreads: 'Union worker threads'};
        $scope.optionsOfTypeInt = Object.keys($scope.intOptionsLabels);

        $scope.boolOptionsLabels =
            {includeInferredDefault: 'Include inferred default', enableServiceAsBoundJoin: 'Enable SERVICE as bound join', isLogQueries: 'Log queries', debugQueryPlan: 'Debug query plan', isLogQueryPlan: 'Log query plan'};
        $scope.optionsOfTypeBool = Object.keys($scope.boolOptionsLabels);

        $scope.fedxMembersNum = 0;
        $scope.fedxMembers = [];

        $scope.hidden = false;

        $scope.$watch('repository', $scope.getLocalRepositories = function() {
            if ($scope.editRepoPage) {
                $scope.startLocalReposOnEdit = $scope.getRepositories();
                let indexesToDelete = [];
                for (let i = 0; i < $scope.fedxMembers.length; i++) {
                    for (let j = 0; j < $scope.startLocalReposOnEdit.length; j++) {
                        if ($scope.startLocalReposOnEdit[j].id === $scope.fedxMembers[i].repositoryName) {
                            indexesToDelete.push(j);
                            break;
                        }
                    }
                }
                for (let i = 0; i < indexesToDelete.length; i++) {
                    $scope.startLocalReposOnEdit.splice(indexesToDelete[i]);
                }

                return $scope.startLocalReposOnEdit.slice();
            } else {
                return $scope.getRepositories();
            }
        });

        $scope.refresh = function(repositoryId, repositoryType, member) {
            var repoMembers = document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').querySelector('.tbody-fedx');
            var newMemberTr = document.createElement('tr');
            newMemberTr.id = repositoryId;
            newMemberTr.className = "repository";
            var td = document.createElement('td');

            var editBtn;
            var editIcon;
            var writableBtn;
            var writableIcon;
            if (repositoryType !== 'native-store') {
                editBtn = document.createElement("btn");
                editBtn.setAttribute("class", "btn btn-link p-0 edit-repository-btn");
                editIcon = document.createElement("span");
                editIcon.setAttribute("class", "icon-edit");
                editBtn.appendChild(editIcon);
                editBtn.style.float = "right";

                writableBtn = document.createElement('btn');
                writableBtn.setAttribute("class", "btn btn-link p-0 secondary");

                writableIcon = document.createElement("span");
                writableIcon.setAttribute("class", "icon-import");
                writableIcon.id=repositoryId + "-icon";
                writableBtn.style.float = "right";
            }

            var closeBtn = document.createElement('btn');
            closeBtn.setAttribute("class", "btn btn-link p-0 secondary");
            var closeIcon = document.createElement("span");
            closeIcon.setAttribute("class", "icon-close");
            closeBtn.style.float = "right";
            closeBtn.appendChild(closeIcon);

            var nodeToDel;
            if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint' && repositoryType !== 'native-store' ) {
                var elIndex = $scope.getRepoIdDOMIndex(repositoryId);
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
            if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint' && repositoryType !== 'native-store') {
                nodeSpan.setAttribute("class", "icon-repo-" + repositoryType);
            } else if (repositoryType === 'native-store') {
                nodeSpan.setAttribute("class", "icon-warning")
            } else {
                nodeSpan.setAttribute("class", "icon-link")
            }
            nodeSpan.innerHTML = repositoryId;
            nodeSpan.setAttribute("ng-model", "repositoryInfo.params.member.repositoryName");
            nodeToAdd.appendChild(nodeSpan);

            closeBtn.addEventListener('click', () => {
                if (repositoryType !== 'graphdb-server' && repositoryType !== 'sparql-endpoint'
                    && repositoryType !== 'native-store') {
                    document.querySelector('.pt-1').querySelector('.form-local-repos').appendChild(nodeToDel);
                }
                repoMembers.removeChild(newMemberTr);
                if (nodeToAdd.id === $scope.writableRepository) {
                    $scope.writableRepository = null;
                }
                $scope.fedxMembersNum--;
                var indexToDelete = $scope.fedxMembers.indexOf(member);
                $scope.fedxMembers.splice(indexToDelete);
                $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
                // $scope.repositoryInfo.params['member'].value = $scope.fedxMembers.map(mem => {
                //     let memObj = {};
                //     memObj["repositoryName"] = mem.repositoryName;
                //     memObj["store"] = mem.store;
                //     return memObj;
                // });

                if ($scope.fedxMembersNum === 0) {
                    document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.alert').setAttribute("style", "display:block");
                    document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').setAttribute("style", "display:none;");
                }
            })

            if (repositoryType !== 'native-store') {
                editBtn.addEventListener('click', () => {
                    if (repositoryType === 'graphdb-server' || repositoryType === 'sparql-endpoint') {
                        $scope.editFedXRepository(repositoryType);
                    } else {
                        $scope.editLocalFedXRepository()
                    }
                })
                writableBtn.addEventListener('click', () => {
                    if ($scope.writableRepository) {
                        var currWritableId = $scope.writableRepository;
                        document.getElementById(currWritableId + "-icon").removeAttribute('style');
                    }

                    writableIcon.style.color="#11b0a1";
                    $scope.writableRepository = repositoryId;
                })
            }

            nodeToAdd.setAttribute("ng-model", repositoryId);
            if (repositoryType !== 'native-store') {
                writableBtn.appendChild(writableIcon);
                nodeToAdd.appendChild(writableBtn);
                nodeToAdd.appendChild(editBtn);

            }
            nodeToAdd.appendChild(closeBtn);

            td.appendChild(nodeToAdd);

            newMemberTr.appendChild(td);
            repoMembers.appendChild(newMemberTr);
            $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
            // $scope.repositoryInfo.params['member'].value = $scope.fedxMembers.map(mem => {
            //     let memObj = {};
            //     memObj["repositoryName"] = mem.repositoryName;
            //     memObj["store"] = mem.store;
            //     return memObj;
            // })
        }

        function create(repositoryId, repositoryType, member) {
            document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.alert').setAttribute("style", "display:none;");
            document.querySelector('.pt-1').querySelector('.mb-1').querySelector('.table').setAttribute("style", "display:block;");
            $scope.refresh(repositoryId, repositoryType, member);
        }

        $scope.addMember = function (repositoryId, repositoryType) {
            $scope.fedxMembersNum++;
            var member={};
            member['store'] = "ResolvableRepository";
            member['repositoryName'] = repositoryId;
            member['repoType'] = repositoryType;
            $scope.fedxMembers.push(member);

            create(repositoryId, repositoryType, member);
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

        $scope.getRepoElement = function(repositoryId) {
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
            let serverUrl = document.querySelector('#addFedXRepositoryForm').querySelector('#server-url').value
            let repoId = document.querySelector('#addFedXRepositoryForm').querySelector('#repository-id').value
            let endpointUrl = document.querySelector('#addFedXRepositoryForm').querySelector('#url-endpoint').value
            if (serverUrl && repoId) {
                $scope.repoid = repoId;
                $scope.serverurl = serverUrl;
                $scope.addMember(repoId + '@' + serverUrl, 'graphdb-server');
            } else {
                $scope.sparqlendpoint = endpointUrl;
                if ($scope.sparqlendpoint.toString().includes("http://")) {
                    $scope.addMember(endpointUrl, 'sparql-endpoint');
                } else {
                    $scope.addMember(endpointUrl, 'native-store');
                }
            }
        };

        if ($scope.editRepoPage) {
            $scope.fedxMembers = $scope.repositoryInfo.params.member.value.slice();
            for (let i = 0; i < $scope.fedxMembers.length; i++) {
                let member = $scope.fedxMembers[i];
                $scope.fedxMembersNum++;
                create(member.repositoryName, member.repoType, member);
            }
        }
    }
}
