import HomeSteps from '../../steps/home-steps.js';
import {RepositorySteps} from '../../steps/repository-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {RepositoryPickerListSteps} from '../../steps/repository-picker-list-steps.js';
import {GraphNavigatorSteps} from '../../steps/graph-navigator-steps.js';
import {ModalDialogSteps} from '../../steps/modal-dialog-steps.js';
import ImportSteps from '../../steps/import/import-steps.js';
import {RepositoryErrorsWidgetSteps} from '../../steps/widgets/repository-errors-widget-steps.js';

const DEPRECATION_MESSAGE = 'FedX will be removed in GraphDB 13. Migrate to SPARQL 1.1 federation.';
const TOOLTIP_DEPRECATION_MESSAGE = 'FedX repositories are deprecated: Will be removed in GraphDB 13. Migrate to SPARQL 1.1 federation.';

describe('FedX deprecation', () => {
    let repositoryId;
    let fedxRepositoryId;

    beforeEach(() => {
        repositoryId = 'fedx-deprecation-member-' + Date.now();
        fedxRepositoryId = 'fedx-deprecation-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.createRepository({
            id: fedxRepositoryId,
            type: 'fedx',
            params: {
                member: {
                    name: 'member',
                    label: 'FedX repo members',
                    value: [{store: 'ResolvableRepository', repositoryName: repositoryId, respectRights: 'true', writable: 'false'}],
                },
            },
        });
    });

    afterEach(() => {
        cy.deleteRepository(fedxRepositoryId);
        cy.deleteRepository(repositoryId);
    });

    it('should mark FedX repositories as deprecated in the repositories list', () => {
        // When I open the repositories list
        RepositorySteps.visit();

        // Then only the FedX repository is marked as deprecated
        RepositorySteps.getRepositoryFedxDeprecatedTag(fedxRepositoryId).should('be.visible').and('have.text', 'Deprecated');
        RepositorySteps.getRepositoryFedxDeprecatedTag(repositoryId).should('not.exist');
    });

    it('should show the deprecation message in the tooltip of a FedX repository in the repositories list', () => {
        // Given I open the repositories list
        RepositorySteps.visit();

        // When I hover the FedX repository
        RepositorySteps.hoverRepositoryInList(fedxRepositoryId);

        // Then its tooltip shows the deprecation message
        RepositorySteps.getRepositoryPopoverDeprecationMessage().should('be.visible').and('contain.text', TOOLTIP_DEPRECATION_MESSAGE);
    });

    it('should mark FedX repositories as deprecated in the repository selector', () => {
        // Given I open the repository selector
        HomeSteps.visit();
        RepositorySelectorSteps.openRepositorySelectors();

        // Then only the FedX repository is marked as deprecated
        RepositorySelectorSteps.getRepositoryFedxDeprecatedTag(fedxRepositoryId).should('be.visible').and('have.text', 'Deprecated');
        RepositorySelectorSteps.getRepositoryFedxDeprecatedTag(repositoryId).should('not.exist');
    });

    it('should show the deprecation message in the tooltip of a FedX repository in the repository selector', () => {
        // Given I open the repository selector
        HomeSteps.visit();
        RepositorySelectorSteps.openRepositorySelectors();

        // When I hover the FedX repository
        RepositorySelectorSteps.hoverRepositoryItem(fedxRepositoryId);

        // Then its tooltip shows the deprecation message
        RepositorySelectorSteps.getRepositoryTooltipPart('deprecation').should('contain.text', TOOLTIP_DEPRECATION_MESSAGE);
    });

    it('should mark FedX repositories as deprecated in the repository picker', () => {
        // Given no repository is selected, so the view shows the repository picker
        GraphNavigatorSteps.visit();

        // Then only the FedX repository is marked as deprecated
        RepositoryPickerListSteps.getRepositoryFedxDeprecatedTag(fedxRepositoryId).should('be.visible').and('have.text', 'Deprecated');
        RepositoryPickerListSteps.getRepositoryFedxDeprecatedTag(repositoryId).should('not.exist');
    });

    it('should show the deprecation message in the information of a FedX repository in the repository picker', () => {
        // Given no repository is selected, so the view shows the repository picker
        GraphNavigatorSteps.visit();

        // When I move the keyboard focus to the FedX repository
        RepositoryPickerListSteps.focusRepository(fedxRepositoryId);

        // Then its information shows the deprecation message and a link to the migration documentation
        RepositoryPickerListSteps.getRepositoryInfoPart('deprecation').should('contain.text', TOOLTIP_DEPRECATION_MESSAGE);
        RepositoryPickerListSteps.getRepositoryInfoPart('fedx-migration-link').should('have.text', 'Learn more')
            .and('have.attr', 'href').and('match', /\/sparql-federation\.html$/);
    });

    it('should mark FedX repositories as deprecated in the Import repository list', () => {
        // When I open the Import view with no repository selected
        ImportSteps.visit();

        // Then only the FedX repository is marked as deprecated
        RepositoryErrorsWidgetSteps.getRepositoryFedxDeprecatedTag(fedxRepositoryId).should('be.visible').and('have.text', 'Deprecated');
        RepositoryErrorsWidgetSteps.getRepositoryFedxDeprecatedTag(repositoryId).should('not.exist');
    });

    it('should mark the FedX repository type as deprecated', () => {
        // When I open the repository type chooser
        RepositorySteps.visit();
        RepositorySteps.createRepository();

        // Then only the FedX type shows the deprecation message
        RepositorySteps.getRepositoryTypeFedxDeprecationMessage('fedx').should('be.visible').and('have.text', 'Deprecated: Will be removed in GraphDB 13.');
        RepositorySteps.getRepositoryTypeFedxDeprecationMessage('gdb').should('not.exist');
        RepositorySteps.getRepositoryTypeFedxDeprecationMessage('ontop').should('not.exist');
    });

    it('should stay on the repository type chooser when the FedX creation is cancelled', () => {
        // Given I open the repository type chooser
        RepositorySteps.visit();
        RepositorySteps.createRepository();

        // When I choose the FedX type
        RepositorySteps.chooseRepositoryType('fedx');

        // Then a dialog asks me to confirm the creation of a deprecated repository
        ModalDialogSteps.verifyDialogBody(DEPRECATION_MESSAGE);
        ModalDialogSteps.verifyDialogBody('Create a FedX repository anyway?');
        RepositorySteps.getFedxDeprecationDialogMigrationLink().should('have.text', 'Learn more in the GraphDB documentation')
            .and('have.attr', 'href').and('match', /\/sparql-federation\.html$/);
        ModalDialogSteps.getDialogBody().should('not.contain.text', '<br>');

        // When I cancel
        ModalDialogSteps.clickOnCancelButton();

        // Then I stay on the repository type chooser
        ModalDialogSteps.getDialog().should('not.exist');
        cy.url().should('match', /\/repository\/create$/);
    });

    it('should show the deprecation warning when a FedX repository is created', () => {
        // Given I open the repository type chooser
        RepositorySteps.visit();
        RepositorySteps.createRepository();

        // When I choose the FedX type and confirm
        RepositorySteps.chooseRepositoryType('fedx');
        ModalDialogSteps.clickOnConfirmButton();

        // Then the FedX create page shows the deprecation warning with a link to the migration guide
        cy.url().should('include', '/repository/create/fedx');
        RepositorySteps.getFedxDeprecationWarning().should('be.visible').and('contain.text', DEPRECATION_MESSAGE);
        RepositorySteps.getFedxMigrationLink().should('have.attr', 'href').and('match', /\/sparql-federation\.html$/);
    });

    it('should show the deprecation warning when a FedX repository is edited', () => {
        // When I edit the FedX repository
        RepositorySteps.visitEditPage(fedxRepositoryId);

        // Then the edit page shows the deprecation warning with a link to the migration guide
        RepositorySteps.getFedxDeprecationWarning().should('be.visible').and('contain.text', DEPRECATION_MESSAGE);
        RepositorySteps.getFedxMigrationLink().should('have.attr', 'href').and('match', /\/sparql-federation\.html$/);
    });

    it('should not show the deprecation warning when another repository is edited', () => {
        // When I edit a GraphDB repository
        RepositorySteps.visitEditPage(repositoryId);

        // Then the edit page shows no deprecation warning
        RepositorySteps.getRepositoryPage().should('be.visible');
        RepositorySteps.getFedxDeprecationWarning().should('not.exist');
    });
});
