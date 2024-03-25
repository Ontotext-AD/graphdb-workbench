angular
    .module('graphdb.framework.importcontext.service', [])
    .factory('ImportContextService', ImportContextService);

ImportContextService.$inject = ['EventEmitterService'];

function ImportContextService(EventEmitterService) {
    let _files = [];

    return {
        getFiles,
        addFile,
        updateFiles,
        onFilesUpdated
    };

    function updateFiles(files) {
        _files = files;
        EventEmitterService.emit('filesUpdated', files);
    }

    function onFilesUpdated(callback) {
        EventEmitterService.subscribe('filesUpdated', callback);
    }

    function addFile(file) {
        _files.push(file);
        EventEmitterService.emit('fileAdded', file);
    }

    function getFiles() {
        return _files;
    }
}
