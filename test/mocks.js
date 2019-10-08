function FakeModal($q, $rootScope) {
    this.$rootScope = $rootScope;
    this.resultDeferred = $q.defer();
    this.result = this.resultDeferred.promise;
}

FakeModal.prototype.open = function (options) {
    return this;
};

FakeModal.prototype.close = function (item) {
    this.resultDeferred.resolve(item);
    // Propagate promise resolution to 'then' functions using $apply().
    this.$rootScope.$apply();
};

FakeModal.prototype.dismiss = function (item) {
    this.resultDeferred.reject(item);
    // Propagate promise resolution to 'then' functions using $apply().
    this.$rootScope.$apply();
};

module.exports = {
    FakeModal: FakeModal
};
