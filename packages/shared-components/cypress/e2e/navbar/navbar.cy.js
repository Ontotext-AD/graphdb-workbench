import {NavbarSteps} from "../../steps/navbar/navbar-steps";

describe('Navbar', () => {
  it('Should render navbar', () => {
    NavbarSteps.visit();
    NavbarSteps.getMainMenu().should('exist');
    NavbarSteps.getRootMenuItems().should('have.length', 7);
  });

  it('Should render submenus', () => {
    NavbarSteps.visit();
    NavbarSteps.getSubmenuItems(1).should('be.hidden');
    NavbarSteps.openSubmenus(1);
    NavbarSteps.getSubmenuItems(1).should('have.length', 5);
    NavbarSteps.closeSubmenus(1);
    NavbarSteps.getSubmenuItems(1).should('be.hidden');
  });
});
