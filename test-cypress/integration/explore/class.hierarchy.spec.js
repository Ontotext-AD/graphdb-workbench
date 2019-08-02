describe('Class hierarchy screen validation', function () {
    let repoId = 'repo' + Date.now();

    before(function () {
        cy.visit('/repository');
        // Create new one
        cy.createNewRepo(repoId).wait(2000);
        cy.setRepoDefault(repoId);
        cy.selectRepo(repoId);

        // Import Wine dataset which will be used in most of the following tests
        cy.navigateToPage('Import', 'RDF');
        cy.openImportURLDialog('https://www.w3.org/TR/owl-guide/wine.rdf');
        cy.clickImportUrlBtn();
        cy.clickImportBtnOnPopUpMenu().wait(2000);
    });

    beforeEach(function () {
        // Go to Explore\Class Hierarchy
        cy.visit('/hierarchy').wait(1000);
    });

    after(function () {
        cy.navigateToPage('Setup', 'Repositories');
        cy.deleteRepo(repoId);
    });

    it('Test initial state of the diagram has a class count 50', function () {
        //  Confirm the initial state of the diagram has a class count of 50
        cy.get('.rz-pointer[role="slider"]')
            .then(($element) => {
                expect($element.prop('aria-valuenow') === 50);
            });
    });

    it('Test show/hide prefixes', function () {
        //  Verify that switching on/off Show/hide prefixes is reflected on the diagram - prefixes are displayed/hidden
        cy.get('#main-group > text.label')
            .each(($element) => {
                // let display = ;
                let parsed = $element.prop('style');
                if (parsed.display != 'none') {
                    expect($element.text()).contain(':');
                }
            });

        // Switch show prefixes to off
        cy.get('button[ng-click="hidePrefixes = !hidePrefixes"]').click().wait(200);

        // Verify that prefixes are removed from diagram
        cy.get('#main-group > text.label')
            .each(($element) => {
                // let display = ;
                let parsed = $element.prop('style');
                if (parsed.display != 'none') {
                    expect($element.text()).not.contain(':');
                }
            });
    });

    it('Test focus on diagram', function () {
        let className = ':CabernetSauvignon';
        // Select a class ":CabernetSauvignon"
        cy.get('#main-group > text.label')
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    let fontSize = $element.prop('style');
                    expect(fontSize['font-size']).be.eq('10px');
                }
            });
        // Verify that the diagram zooms that class
        cy.get('.p-0 > .icon-search')
            .click()
            .then(() => {
                cy.get('#search_input_value').type(className).type('{enter}').wait(500);
            });

        // Find class ":CabernetSauvignon" and verify changed font-size
        cy.get('#main-group > text.label')
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    let fontSize = $element.prop('style');
                    expect(fontSize['font-size']).not.be.eq('10px');
                }
            });
        // Click on ""Focus diagram""
        cy.get('.icon-zoom-out').click({force: true}).wait(500);
        // Verify that the diagram zooms out without resetting the class count.
        // Select a class ":CabernetSauvignon"
        cy.get('#main-group > text.label')
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    let fontSize = $element.prop('style');
                    expect(fontSize['font-size']).be.eq('10px');
                }
            });
    });

    it('Test reload diagram', function () {
        let className = ':CabernetSauvignon';

        //  Confirm the initial state of the diagram has a class count of 50
        cy.get('.rz-pointer[role="slider"]')
            .then(($element) => {
                expect($element.prop('aria-valuenow') === 50);
            });

        // Change the class count to custom value
        cy.get('.class-cnt-slider > .ng-isolate-scope')
            .trigger('click', 'center', {force: true});

        // Select a class ":CabernetSauvignon"
        cy.get('#main-group > text.label')
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    let fontSize = $element.prop('style');
                    expect(fontSize['font-size']).be.eq('10px');
                }
            });
        // Verify that the diagram zooms that class
        cy.get('.p-0 > .icon-search')
            .click()
            .then(() => {
                cy.get('#search_input_value').type(className).type('{enter}').wait(500);
            });

        // Find class ":CabernetSauvignon" and verify changed font-size
        cy.get('#main-group > text.label')
            .each(($element) => {
                let data = $element.prop('__data__');
                if (data.name === className) {
                    let fontSize = $element.prop('style');
                    expect(fontSize['font-size']).not.be.eq('10px');
                }
            });

        // Click on "Reload diagram"
        cy.get('#toolbar > [tooltip="Reload diagram"] > .icon-reload').click({force: true}).wait(200);

        // Verify that warning message appears
        cy.get('.modal-body > .lead').should('be.visible').and('contain', 'Calculating class hierarchy data may take some time. Are you sure?');

        // Confirm diagram reloading
        cy.get('.modal-footer > .btn-primary').click().wait(200);

        // Verify that the diagram zooms out and the class count is reset
        cy.get('.rz-pointer[role="slider"]')
            .then(($element) => {
                expect($element.prop('aria-valuenow') === 50);
            });
    });
    it('Test export diagram', function () {
        // Export the diagram
        cy.get('#download-svg')
            .then(($element) => {
                let href = $element.prop('href');
                // Verify that a svg with the current diagram state is saved on your hdd.
                expect(href).to.contain(Cypress.config("baseUrl"));
            });
    });

    it('Test search for a class', function () {
        // Search for wine"
        let className = 'wine';
        cy.get('#search_input_dropdown')
            .should('not.be.visible');
        cy.get('.p-0 > .icon-search')
            .click()
            .then(() => {
                cy.get('#search_input_value').type(className).type('{enter}');
            });
        // Verify that a list of suggestions is displayed.
        cy.get('#search_input_dropdown')
            .should('be.visible')
            .and('length.be.gt', 0);

        // Click on a suggested random third class
        cy.get('#search_input_dropdown > :nth-child(3)')
            .then(($el) => {
                let selectedClassName = $el.text().trim();

                // Find selected class from drop-down menu and verify that isn't expanded
                cy.get('#main-group > text.label')
                    .each(($element) => {
                        let data = $element.prop('__data__');
                        if (data.name === selectedClassName) {
                            let fontSize = $element.prop('style');
                            expect(fontSize['font-size']).be.eq('10px');
                        }
                    });

                cy.wrap($el).click().wait(500);

                // Find selected class from drop-down menu after clicking on it and verify that it is expanded
                cy.get('#main-group > text.label')
                    .each(($element) => {
                        let data = $element.prop('__data__');
                        if (data.name === selectedClassName) {
                            let fontSize = $element.prop('style');
                            expect(fontSize['font-size']).not.be.eq('10px');
                        }
                    });
            });
    });
});
