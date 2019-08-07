import "angular/core/services";

describe('menu items service', function () {
    //test setup
    var menuItems, httpBackend;

    beforeEach(angular.mock.module("graphdb.framework.core", function ($menuItemsProvider) {
        $menuItemsProvider.addItem({label: 'SPARQL', href: 'sparql', order: 2, role: 'IS_AUTHENTICATED_FULLY'});
        $menuItemsProvider.addItem({label: 'Admin', href: '#', order: 3, role: 'ROLE_ADMIN'});
        $menuItemsProvider.addItem({label: 'Users and Access', href: 'users', order: 3, parent: 'Admin'});
        $menuItemsProvider.addItem({label: 'Repositories', href: 'repositories', order: 1, parent: 'Admin'});
    }));

    beforeEach(angular.mock.inject(function ($menuItems, $httpBackend) {
        menuItems = $menuItems;
        httpBackend = $httpBackend;
    }));


    it('sorts menu items according to order property', function () {
        expect(menuItems.length).toBe(2);
        expect(menuItems[0].label).toBe('SPARQL');
        expect(menuItems[1].label).toBe('Admin');
        expect(menuItems[1].children.length).toBe(2);
        expect(menuItems[1].children[0].label).toBe('Repositories');
    });
});
