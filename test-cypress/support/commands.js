// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import './repository-commands';

// ================================================================================
// ================================================================================
// ========================= FOR REVIEW / REFACTOR/ REMOVAL =======================
// ================================================================================
// ================================================================================

let openImportURLDialog = Cypress.Commands.add('openImportURLDialog', (importURL) => {
    cy.get('i[class="icon-link icon-lg pull-left"]').click();
    cy.get('#dataUrl').type(importURL);
});

let openImportURLDialogS = Cypress.Commands.add('openImportURLDialogS', (importURL) => {
    cy.get('i[class="icon-link icon-lg pull-left"]').should("be.visible");
    cy.get(".ot-loader-new-content").should("not.be.visible");
    cy.get('i[class="icon-link icon-lg pull-left"]').should("be.visible");
    cy.get('i[class="icon-link icon-lg pull-left"]').click();
    cy.get('#dataUrl').should("be.visible").type(importURL);
});

let clickImportUrlBtn = Cypress.Commands.add('clickImportUrlBtn', () => {
    cy.get('#wb-import-importUrl').click();
});

let verifyFileUpload = Cypress.Commands.add('verifyFileUpload', (importURL) => {
    cy.get('#wb-import-fileInFiles').should('contain', importURL);
});

let verifyMessageOccurs = Cypress.Commands.add('verifyMessageOccurs', (message) => {
    cy.get('#wb-import-fileInFiles').then(() => {
        cy.get('.d-inline-block > :nth-child(2)').should('contain', message);
    })
});

let selectRDFFormat = Cypress.Commands.add('selectRDFFormat', (rdfFormat) => {
    cy.get('.modal-footer > :nth-child(2) > .btn-group > .btn').click({force: true});

    cy.get('.modal-footer > :nth-child(2) > .btn-group > .dropdown-menu > li', {timeout: 1000})
        .each(($btn, index) => {
            if ($btn.text().trim() === rdfFormat) {
                cy.get('.modal-footer')
                // Need to be in modal footer context to use this
                // method in all dialog windows
                    .within(() => {
                        cy.get(`:nth-child(${(index + 1)}) > .dropdown-item`).click({force: true});
                    });
            }
        })
});

Cypress.Commands.add('clickImportButton', () => {
    cy.get('[class="menu-item-icon icon-import"]')
        .click({force: true});
});

Cypress.Commands.add('selectRDFLinkButton', () => {
    cy.get('[href="import"]')
        .click({force: true});
});


Cypress.Commands.add('selectRepo', (repoId) => {
    cy.get('#repositorySelectDropdown', {timeout: 30000}).should('be.visible');

    // Wait until repositories GET request finishes and the menu is updated
    cy.get('#repositorySelectDropdown .no-repositories').should('not.be.visible');

    cy.get('#repositorySelectDropdown').click().within(() => {
        // TODO: Force is necessary because the repo name could be hidden in quite long menu -> try to fix it
        // After selecting the repository, the menu item should be detached from the DOM as possible selection
        cy.get('.dropdown-item', {timeout: 1000}).contains(repoId).click({force: true}).should('not.exist');
    });
});

Cypress.Commands.add('selectRepoS', (repoId) => {
    cy.get(".ot-loader-new-content").should("not.be.visible");
    cy.get(".ot-loader").should("not.be.visible");
    cy.get(".ot-main-loader").should("not.be.visible");
    cy.get('#wb-repositories-repositoryInGetRepositories tr:contains("' + repoId + '") .icon-connection-off', {timeout: 2000})
        .should("be.visible", {timeout: 1000});
    cy.get('#wb-repositories-repositoryInGetRepositories tr:contains("' + repoId + '") .icon-connection-off', {timeout: 2000})
        .click();
});


let clickImportBtnOnPopUpMenu = Cypress.Commands.add('clickImportBtnOnPopUpMenu', () => {
    cy.get('.modal-footer > .btn-primary')
        .click().wait(3000);
});

let removeUploadedFiles = Cypress.Commands.add('removeUploadedFiles', () => {
    cy.get('#import-user > [files-table=""] > [ng-hide="loader"] > .mb-1 > ' +
        '.form-inline.ng-pristine > .btn-link > .form-check-input')
        .check({force: true}).should('be.checked');

    cy.get('#wb-import-removeEntries')
        .click({force: true});

});

let resetStatusOfUploadedFiles = Cypress.Commands.add('resetStatusOfUploadedFiles', () => {
    cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > .mb-1 > .form-inline.ng-valid > #wb-import-clearStatuses')
        .click({force: true});
});

let openImportTextSnippetDialog = Cypress.Commands.add('openImportTextSnippetDialog', () => {
    cy.get('i[class="icon-edit icon-lg pull-left"]')
        .click({force: true});
});

let fillRDFTextSnippet = Cypress.Commands.add('fillRDFTextSnippet', (rdfTextSnippet) => {
    cy.get('#wb-import-textarea').invoke('val', rdfTextSnippet).trigger('change', {force: true});
});

let clickImportRDFTextSnippetBtn = Cypress.Commands.add('clickImportRDFTextSnippetBtn', () => {
    cy.get('#wb-import-importText')
        .click({force: true});
});

let fillBaseURIInputField = Cypress.Commands.add('fillBaseURIInputField', (baseURI) => {
    cy.get('.form-horizontal > :nth-child(1) > .col-lg-9 > .form-control')
        .invoke('val', baseURI).trigger('change', {force: true}).should('have.value', baseURI);
});

let selectNamedGraphCheck = Cypress.Commands.add('selectNamedGraphCheck', () => {
    cy.get('[popover="Import everything into a user-specified named graph."] > .ng-pristine')
        .check().should('be.checked');
});

let fillNamedGraphInputField = Cypress.Commands.add('fillNamedGraphInputField', (namedGraph) => {
    cy.get('.col-lg-9 > :nth-child(2) > .form-control')
        .invoke('val', namedGraph).trigger('change', {force: true}).should('have.value', namedGraph);
});

let expandAdvancedSettings = Cypress.Commands.add('expandAdvancedSettings', () => {
    cy.get('[ng-hide="showAdvancedSettings"]')
        .click({force: true});
});

let chooseServerFilesTab = Cypress.Commands.add('chooseServerFilesTab', () => {
    cy.get('#wb-import-tabServer > .nav-link').click({force: true});
});

let checkAllServerFiles = Cypress.Commands.add('checkAllServerFiles', (clickCheck) => {
    cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > .mb-1 > .form-inline.ng-valid > .btn-link > .form-check-input')
        .then(($el) => {
            if (clickCheck) {
                cy.wrap($el).check();
            } else {
                cy.wrap($el).uncheck();
            }
        });
});

let selectDistinctFileToImport = Cypress.Commands.add('selectDistinctFileToImport', (fileToSelect) => {
    cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > #wb-import-fileInFiles > tbody > tr > td > .d-inline-block > div > strong .ng-binding')
        .each(($el, index) => {
            if ($el.text().trim().indexOf(fileToSelect) !== -1) {
                cy.get(`:nth-child(${index + 1}) > :nth-child(1) > .m-0 > .ng-pristine`, {timeout: 1000}).check({force: true});
            }
        });
});

let importChangingSettings = Cypress.Commands.add('importChangingSettings', (changeSettings) => {
    if (changeSettings) {
        cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > ' +
            '.mb-1 > .form-inline.ng-valid > .btn-group > [ng-click="setSettingsFor(\'\')"]')
            .click({force: true});
    } else {
        cy.get('#import-server > [files-table=""] > ' +
            '[ng-hide="loader"] > .mb-1 > .form-inline.ng-valid > .btn-group > .dropdown-toggle-split')
            .click({force: true})
            .then(() => {
                cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > .mb-1 > ' +
                    '.form-inline.ng-valid > .btn-group > .dropdown-menu > li > .dropdown-item')
                    .click({force: true});
            });
    }
});

let confirmTextPresentsInFileInfo = Cypress.Commands.add('confirmTextPresentsInFileInfo', (textToSearchFor, fileToSelect) => {
    cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > #wb-import-fileInFiles > :nth-child(1) > .ng-scope > :nth-child(2) > .d-inline-block > :nth-child(2) > .icon-info')
        .trigger('mouseover')
        .then(() => {
            cy.get('.popover-content').should('contain', textToSearchFor);
        })
});

let confirmTextPresentsInDistinctFileInfo = Cypress.Commands.add('confirmTextPresentsInDistinctFileInfo', (textToSearchFor, fileToSelect) => {
    cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > #wb-import-fileInFiles > tbody > tr > td > .d-inline-block > div > strong .ng-binding')
        .each(($el, index) => {
            if ($el.text().trim().indexOf(fileToSelect) !== -1) {
                cy.get('#import-server > [files-table=""] > [ng-hide="loader"] > #wb-import-fileInFiles > :nth-child(1) > ' +
                    '.ng-scope > :nth-child(2) > .d-inline-block > :nth-child(2) > .icon-info').eq(index)
                    .trigger('mouseover', {force: true})
                    .then(() => {
                        cy.get('.popover-content').should('contain', textToSearchFor);
                    })
            }
        });
});

let navigateToPage = Cypress.Commands.add('navigateToPage', (mainMenu, subMenu) => {
    cy.get('.main-menu')
        .contains(mainMenu, {timeout: 1000})
        .click({force: true})
        .then(() => {
            if (subMenu) {
                cy.get('.sub-menu', {timeout: 1000})
                    .contains(subMenu, {timeout: 1000})
                    .click({force: true})
                    .wait(500);
            }
        });
});

let navigateToPageS = Cypress.Commands.add('navigateToPageS', (mainMenu, subMenu) => {
    //we assume here we do not have two submenus with the same text???
    if (mainMenu == 'Setup' && subMenu == 'Repositories') {
        cy.visit('/repository');
    }
    if (mainMenu == 'Import' && subMenu == 'RDF') {
        cy.visit('/import');
    }
    if (mainMenu == 'SPARQL') {
        cy.visit('/sparql');
    }
    if (mainMenu == 'Home') {
        cy.visit('/');
    }
    if (mainMenu == 'Setup' && subMenu == 'Autocomplete') {
        cy.visit('/autocomplete');
    }
    if (mainMenu == 'Explore' && subMenu == 'Class hierarchy') {
        cy.visit('/hierarchy');
    }

    cy.get(".show-ng-cloak.ot-splash").should("not.be.visible");
    cy.get(".ot-loader-new-content").should("not.be.visible");
    cy.wait(500);
});

let createNewRepo = Cypress.Commands.add('createNewRepo', (repoId, rulesetToSelect, enableSameAs) => {
    // TODO: Sometimes the page is not yet loaded and this fails ?!
    cy.get('#wb-repositories-addRepositoryLink', {timeout: 1000})
        .click({force: true});

    cy.url()
        .should('include', '/repository/create');

    cy.get('#id')
        .type(repoId, {force: true});

    if (rulesetToSelect) {
        cy.get('#ruleset').select(rulesetToSelect);
    }

    if (enableSameAs) {
        cy.get('#disableSameAs').uncheck();
    }

    cy.get('#addSaveRepository')
        .click({force: true});
});

let createNewRepoS = Cypress.Commands.add('createNewRepoS', (repoId, rulesetToSelect, enableSameAs) => {
    cy.get('#wb-repositories-addRepositoryLink').should("be.visible").then(($link) => {
        cy.get('#wb-repositories-addRepositoryLink').click();
    });
    cy.url()
        .should('include', '/repository/create');

    cy.get('#id').should("be.visible").then(($link) => {
        cy.get('#id').type(repoId);
    });

    if (rulesetToSelect) {
        cy.get('#ruleset').select(rulesetToSelect);
    }

    if (enableSameAs) {
        cy.get('#disableSameAs').uncheck();
    }

    cy.get('#addSaveRepository').click();
});

let setRepoDefault = Cypress.Commands.add('setRepoDefault', (repoId) => {
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr')
        .each(($el, index) => {
            if ($el.text().trim() === repoId) {
                cy.get('i.icon-pin').eq(index).click({force: true});
            }
        });
});

let setRepoDefaultS = Cypress.Commands.add('setRepoDefaultS', (repoId) => {
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr:contains(' + repoId + ') i.icon-pin')
        .should("be.visible", {timeout: 2000});
    cy.wait(1000);
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr:contains(' + repoId + ') i.icon-pin')
        .click({timeout: 2000});

});

let deleteRepo = Cypress.Commands.add('deleteRepo', (repoId) => {
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr')
        .each(($el, index) => {
            if ($el.text().trim() === repoId) {
                cy.get('.secondary > .icon-trash').eq(index).click({force: true, multiple: true})
                    .then(() => {
                        cy.get('.modal-dialog > .modal-content > .modal-footer.ng-scope > .btn.btn-primary').click({
                            force: true,
                            multiple: true
                        });
                    });
            }
        });
});

let deleteRepoS = Cypress.Commands.add('deleteRepoS', (repoId) => {
    //we need the Navigate to RDF beacause of a problem on clicking the delete icon (probably after modal was just opened in SPARQL tests)
    cy.navigateToPageS('Import', 'RDF');
    cy.navigateToPageS('Setup', 'Repositories');
    cy.wait(5000);
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr:contains("' + repoId + '") .secondary > .icon-trash')
        .should('have.length', 1)
        .should("be.visible");
    cy.get('#wb-repositories-repositoryInGetRepositories > tbody > tr:contains("' + repoId + '") .secondary > .icon-trash')
        .click();
    cy.wait(5000);
    cy.get('.modal-dialog > .modal-content > .modal-footer.ng-scope .btn.btn-primary').click();

});


let executeCustomQuery_old = Cypress.Commands.add('executeCustomQuery_old', (query) => {

    cy.get('.CodeMirror textarea').type('{ctrl}a{backspace}', {force: true}).wait(500).invoke('val', query).trigger('change', {force: true}).wait(2000)
        .then(() => {
            cy.get('div#runButton > #wb-sparql-runQuery').click().wait(2000);
        });
});

let executeCustomQuery = Cypress.Commands.add('executeCustomQuery', (query) => {
    cy.get(".CodeMirror textarea").should("be.visible");
    cy.get(".ot-loader-new-content").should("not.be.visible");
    cy.wait(1000);
    cy.get('.CodeMirror textarea')
        .type('{ctrl}a{backspace}', {force: true})
        .wait(500).invoke('val', query).trigger('change', {force: true}).wait(2000);
    cy.get('div#runButton > #wb-sparql-runQuery').click().wait(2000);
});


let verifyUpdateMessage = Cypress.Commands.add('verifyUpdateMessage', (message) => {
    cy.get('#yasr-inner .alert.alert-info.no-icon.results-info.update-info.ng-binding')
        .should('contain', message);
    cy.get('#yasr-inner span[ng-show="currentTabConfig.timeTook"]')
        .should('contain', 'Update took');
});

let verifyQueryResults = Cypress.Commands.add('verifyQueryResults', (numberOfResults) => {
    cy.get('#yasr-inner')
        .then(() => {
            cy.get('.alert.alert-info.no-icon > .text-xs-right').wait(1000)
                .then(() => {
                    let message = numberOfResults ? 'Showing results from 1 to ' + numberOfResults : 'Showing results from 1 to ';
                    cy.get('span[ng-show="currentTabConfig.queryType != \'ASK\'"]')
                        .should('contain', message);

                    cy.get('span[ng-show="currentTabConfig.timeTook"]')
                        .should('contain', 'Query took');
                });
        });
});

let verifyQueryResultsS = Cypress.Commands.add('verifyQueryResultsS', (numberOfResults) => {
    let message = numberOfResults ? 'Showing results from 1 to ' + numberOfResults : 'Showing results from 1 to ';
    cy.get('#yasr-inner .alert.alert-info.no-icon').not("ng-hide")
        .should("be.visible", {timeout: 10000});
    cy.get('#yasr-inner .alert.alert-info.no-icon').not("ng-hide")
        .should('contain', message);
    cy.get('#yasr-inner .alert.alert-info.no-icon').not("ng-hide")
        .should('contain', 'Query took');
});


//verifies that a certain graph exist within the current page in graphs overview.
let verifyGraphExists = Cypress.Commands.add('verifyGraphExists', (graphName) => {
    cy.wait(500);
    cy.get("tbody").should('contain', graphName);
});
