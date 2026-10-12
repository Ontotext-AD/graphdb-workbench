import {NavbarSteps} from "../../steps/navbar/navbar-steps";

describe('Navbar', () => {
  it('Should render navbar', () => {
    // Given I've opened a page with the navbar
    // When the page is loaded
    NavbarSteps.visit();
    // Then the navbar should be rendered
    NavbarSteps.getMainMenu().should('exist');
    NavbarSteps.getRootMenuItems().should('have.length', 7);
  });

  it('Should render submenus', () => {
    // Given I've opened a page with the navbar
    // When the page is loaded
    NavbarSteps.visit();
    // Then I should see only root menu items
    NavbarSteps.getSubmenuItems(1).should('be.hidden');
    // When I open a submenu
    NavbarSteps.openSubmenus(1);
    // Then I should see submenu items
    NavbarSteps.getSubmenuItems(1).should('have.length', 5);
    // When I close the submenu
    NavbarSteps.closeSubmenus(1);
    // Then I should not see submenu items
    NavbarSteps.getSubmenuItems(1).should('be.hidden');
  });

  it('Should be able to toggle the navbar', () => {
    NavbarSteps.visit();
    // Given the navbar is expanded by default
    NavbarSteps.getMainMenu().should('not.have.class', 'collapsed');
    NavbarSteps.getRootMenuItem(0).find('.menu-item').should('be.visible');
    // When I toggle it
    NavbarSteps.toggleNavbar();
    // Then the navbar should be collapsed
    // (the labels are hidden visually only, so they still name the icon-only items)
    NavbarSteps.getMainMenu().should('have.class', 'collapsed');
    // When I toggle it again
    NavbarSteps.toggleNavbar();
    // Then the navbar should be expanded
    NavbarSteps.getMainMenu().should('not.have.class', 'collapsed');
    NavbarSteps.getRootMenuItem(0).find('.menu-item').should('be.visible');
  });
});
