import {proof, verifyRepoId} from './verify-support';

describe('verify: aria-current="page" on navbar links', () => {
  it('sets aria-current="page" on the active navbar link', () => {
    // Start at repositories page
    cy.visit('/repository');
    cy.wait(500);

    // Verify Repositories link has aria-current="page"
    cy.get('a[href="repository"]').should('have.attr', 'aria-current', 'page');

    // Other links should not have aria-current
    cy.get('a[href="sparql"]').should('not.have.attr', 'aria-current', 'page');
    cy.get('a[href="import"]').should('not.have.attr', 'aria-current', 'page');

    proof('01-repositories-page');

    // Navigate to SPARQL page
    cy.visit('/sparql');
    cy.wait(500);

    // Verify SPARQL link now has aria-current="page"
    cy.get('a[href="sparql"]').should('have.attr', 'aria-current', 'page');

    // Repositories link should no longer have aria-current
    cy.get('a[href="repository"]').should('not.have.attr', 'aria-current', 'page');
    cy.get('a[href="import"]').should('not.have.attr', 'aria-current', 'page');

    proof('02-sparql-page');

    // Navigate to Import page
    cy.visit('/import');
    cy.wait(500);

    // Verify Import link now has aria-current="page"
    cy.get('a[href="import"]').should('have.attr', 'aria-current', 'page');

    // Other links should not have aria-current
    cy.get('a[href="sparql"]').should('not.have.attr', 'aria-current', 'page');
    cy.get('a[href="repository"]').should('not.have.attr', 'aria-current', 'page');

    proof('03-import-page');
  });

  it('sets aria-current="page" on submenu links when they are the current page', () => {
    // Navigate to a submenu page (Setup → Repositories)
    cy.visit('/repository');
    cy.wait(500);

    // The Repositories link in the Setup submenu should have aria-current="page"
    // since we're on the /repository page
    cy.get('a[href="repository"]')
      .should('have.attr', 'aria-current', 'page')
      .parents('li.sub-menu-item')
      .should('have.class', 'active');

    proof('04-submenu-repositories-active');

    // Navigate to another submenu item (Setup → Users and Access)
    cy.visit('/users');
    cy.wait(500);

    // Verify Users and Access link now has aria-current="page"
    cy.get('a[href="users"]').should('have.attr', 'aria-current', 'page');

    // Repositories should no longer have it
    cy.get('a[href="repository"]').should('not.have.attr', 'aria-current', 'page');

    proof('05-submenu-users-active');
  });
});
