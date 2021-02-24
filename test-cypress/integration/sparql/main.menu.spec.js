describe('Main menu tests', function () {

    beforeEach(function () {
        cy.visit('');

        cy.get('.card-title').should('contain', 'Welcome to GraphDB');
    });

    it('Test main menu visibility and redirects', () => {
        const menuItems = [
            {
                name: 'Import',
                visible: true,
                submenu: [
                    {
                        name: 'RDF',
                        visible: false,
                        redirect: '/import'
                    },
                    {
                        name: 'Tabular (OntoRefine)',
                        visible: false,
                        redirect: '/ontorefine'
                    }
                ]
            },
            {
                name: 'Explore',
                visible: true,
                submenu: [
                    {
                        name: 'Graphs overview',
                        visible: false,
                        redirect: '/graphs'
                    },
                    {
                        name: 'Class hierarchy',
                        visible: false,
                        redirect: '/hierarchy'
                    },
                    {
                        name: 'Class relationships',
                        visible: false,
                        redirect: '/relationships'
                    },
                    {
                        name: 'Visual graph',
                        visible: false,
                        redirect: '/graphs-visualizations'
                    },
                    {
                        name: 'Similarity',
                        visible: false,
                        redirect: '/similarity'
                    }
                ]
            },
            {
                name: 'SPARQL',
                visible: true,
                redirect: '/sparql'
            },
            {
                name: 'Monitor',
                visible: true,
                submenu: [
                    {
                        name: 'Queries and Updates',
                        visible: false,
                        redirect: '/queries'
                    },
                    {
                        name: 'Resources',
                        visible: false,
                        redirect: '/resources'
                    }
                ]
            },
            {
                name: 'Setup',
                visible: true,
                submenu: [
                    {
                        name: 'Repositories',
                        visible: false,
                        redirect: '/repository'
                    },
                    {
                        name: 'Users and Access',
                        visible: false,
                        redirect: '/users'
                    },
                    {
                        name: 'My Settings',
                        visible: false,
                        redirect: '/settings'
                    },
                    {
                        name: 'Connectors',
                        visible: false,
                        redirect: '/connectors'
                    },
                    {
                        name: 'Namespaces',
                        visible: false,
                        redirect: '/namespaces'
                    },
                    {
                        name: 'Autocomplete',
                        visible: false,
                        redirect: '/autocomplete'
                    },
                    {
                        name: 'RDF Rank',
                        visible: false,
                        redirect: '/rdfrank'
                    }
                ]
            },
            {
                name: 'Help',
                visible: true,
                submenu: [
                    {
                        name: 'REST API',
                        visible: false,
                        redirect: '/webapi'
                    },
                    {
                        name: 'Documentation',
                        visible: false,
                        externalRedirect: 'https://graphdb.ontotext.com/documentation/'
                    },
                    {
                        name: 'Developer Hub',
                        visible: false,
                        externalRedirect: '/devhub/'
                    },
                    {
                        name: 'Support',
                        visible: false,
                        externalRedirect: 'https://graphdb.ontotext.com/'
                    },
                    {
                        name: 'System information',
                        visible: false,
                        redirect: '/sysinfo'
                    }
                ]
            }
        ];

        menuItems.forEach((menu, menuIndex) => {
            let menuVisibilityCheck = menu.visible ? 'be.visible' : 'not.be.visible';
            // Verify that main menu items are present and their visibility
            cy.get('.main-menu .menu-element-root').eq(menuIndex + 1).as('menu')
                .should(menuVisibilityCheck).and('contain', menu.name);

            // Verify submenu items and their visibility when the main menu is not opened
            (menu.submenu || []).forEach((submenu, submenuIndex) => {
                let submenuVisibilityCheck = submenu.visible ? 'be.visible' : 'not.be.visible';
                cy.get('@menu').next('.sub-menu').find('.sub-menu-item').eq(submenuIndex)
                    .should(submenuVisibilityCheck).and('contain', submenu.name);
            });

            cy.get('@menu').click().then(() => {
                (menu.submenu || []).forEach((submenu, submenuIndex) => {
                    // Verify submenu items visibility when the main menu is opened.
                    cy.get('@menu').next('.sub-menu').find('.sub-menu-item').eq(submenuIndex).as('submenu')
                        .should('be.visible').and('contain', submenu.name);

                    // Also verify redirection performed from submenu links. Some links open page on
                    // external domain so those are not opened but the link href attribute is verified
                    // instead.
                    if (submenu.redirect) {
                        cy.get('@submenu').find('a').click();
                        cy.url().should('include', submenu.redirect);
                    } else if (submenu.externalRedirect) {
                        cy.get('@submenu').find('a')
                            .should('have.attr', 'href').and('include', submenu.externalRedirect);
                    }
                });
            });
        });
    });
});
