angular
    .module('graphdb.framework.impex.import.controllers.import-text-snippet', [])
    .controller('ImportTextSnippetController', ImportTextSnippetController);

ImportTextSnippetController.$inject = ['$scope', '$uibModalInstance', 'text', 'format'];

function ImportTextSnippetController($scope, $uibModalInstance, text, format) {

    // =========================
    // Public variables
    // =========================

    $scope.importFormats = [
        {name: 'RDF/JSON', type: 'application/rdf+json'},
        {name: 'JSON-LD', type: 'application/ld+json'},
        {name: 'NDJSON-LD', type: 'application/x-ld+ndjson'},
        {name: 'RDF/XML', type: 'application/rdf+xml'},
        {name: 'N3', type: 'text/rdf+n3'},
        {name: 'N-Triples', type: 'text/plain'},
        {name: 'N-Quads', type: 'text/x-nquads'},
        {name: 'Turtle', type: 'text/turtle'},
        {name: 'Turtle*', type: 'application/x-turtlestar'},
        {name: 'TriX', type: 'application/trix'},
        {name: 'TriG', type: 'application/x-trig'},
        {name: 'TriG*', type: 'application/x-trigstar'}
    ];
    $scope.rdfText = text;
    $scope.importFormat = $scope.importFormats.find((formatModel) => formatModel.type === format);
    $scope.startImport = true;
    // Total amount of characters that can be imported via the text snippet dialog
    $scope.sizeLimit = 100000;


    // =========================
    // Public functions
    // =========================

    $scope.setFormat = (format) => {
        $scope.importFormat = format;
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss();
    };

    $scope.ok = () => {
        $uibModalInstance.close({
            text: $scope.rdfText,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}
