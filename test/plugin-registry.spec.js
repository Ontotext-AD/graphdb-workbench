const registry = window.PluginRegistry;

describe('PluginRegistry', function () {
    beforeEach(function () {
        registry.clear('route');
    });

    it('add unordered plugins', function () {
        registry.add('route', {
            'stateName': 'login'
        });

        registry.add('route', {
            'stateName': 'search'
        });

        expect(registry.get('route').length).toEqual(2);
    });

    it('add multiple unordered plugins as array', function () {
        registry.add('route', [
            {
                'stateName': 'login'
            },
            {
                'stateName': 'search'
            }
        ]);

        expect(registry.get('route').length).toEqual(2);
    });

    it('add only enabled plugins', () => {
        registry.add('route', {
            'order': 1,
            'stateName': 'search',
            'disabled': true
        });

        registry.add('route', {
            'order': 2,
            'stateName': 'login'
        });

        expect(registry.get('route').length).toEqual(1);
        expect(registry.get('route')[0]).toEqual({
            'order': 2,
            'stateName': 'login',
            'priority': 0
        });
    });

    it('add throws error when adding an ordered plugin to unordered list', function () {
        registry.add('route', {
            'stateName': 'login'
        });

        expect(function () {
            registry.add('route', {
                'order': 1,
                'stateName': 'search'
            });
        }).toThrow();

        expect(registry.get('route').length).toEqual(1);
    });

    it('add ordered plugins', function () {
        registry.add('route', {
            'order': 2,
            'stateName': 'search'
        });

        registry.add('route', {
            'order': 1,
            'stateName': 'login'
        });

        const result = registry.get('route');

        expect(result.length).toEqual(2);

        expect(result[0].order).toEqual(1);
        expect(result[1].order).toEqual(2);
    });

    it('add two plugins with the same order', function () {
        registry.add('route', {
            'order': 2,
            'stateName': 'search',
        });

        expect(function () {
            registry.add('route', {
                'order': 2,
                'stateName': 'search'
            });
        }).toThrow();

        expect(registry.get('route').length).toEqual(1);
    });

    it('add two plugins with the same order but greater priority', function () {
        registry.add('route', {
            'order': 2,
            'priority': 1,
            'stateName': 'search'
        });

        registry.add('route', {
            'order': 2,
            'priority': 2,
            'stateName': 'login'
        });

        expect(registry.get('route').length).toEqual(1);
    });

    it('add two plugins with the same order but lower priority', function () {
        registry.add('route', {
            'order': 2,
            'priority': 2,
            'stateName': 'search'
        });

        registry.add('route', {
            'order': 2,
            'priority': 1,
            'stateName': 'login'
        });

        expect(registry.get('route').length).toEqual(1);
    });

    it('add throws error when adding unordered plugin to an ordered list', function () {
        registry.add('route', {
            'order': 1,
            'stateName': 'login'
        });

        expect(function () {
            registry.add('route', {
                'stateName': 'search'
            });
        }).toThrow();

        expect(registry.get('route').length).toEqual(1);
    });

    it('add ordered plugin with non-number priority', function () {
        expect(function () {
            registry.add('noNumberPriority', {
                'order': 1,
                'priority': '1',
                'stateName': 'search'
            });
        }).toThrow();

        expect(registry.get('noNumberPriority').length).toEqual(0);
    });

    it('should return registered plugins', () => {
        registry.add('route', [
            {
                'stateName': 'login'
            },
            {
                'stateName': 'search'
            }
        ]);
        const modules = registry.listModules();
        expect(modules.route[0]).toEqual({'stateName': 'login'});
        expect(modules.route[1]).toEqual({'stateName': 'search'});
        expect(modules.route.ordered).toEqual(false);
    });
});
