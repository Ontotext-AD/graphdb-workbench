import {NavbarSteps} from "../../steps/navbar/navbar-steps";
import {LayoutSteps} from "../../steps/layout/layout-steps";
import {HeaderSteps} from "../../steps/header/header-steps";

function assertSubmenuItems(menuIndex, expectedItems) {
  NavbarSteps.getSubmenuItems(menuIndex)
    .should('have.length', expectedItems.length)
    .children()
    .each(($submenuItem, index) => {
      expect($submenuItem.text()).to.equal(expectedItems[index]);
    });
}

describe('Layout', () => {
  it('Should filter menu items, based on role', () => {
    // Given I've visited the layout page and loaded menu items for the navbar
    LayoutSteps.visit();
    LayoutSteps.disableSecurity();

    const monitoringMenuIndex = 3;
    const setupMenuIndex = 4;
    const helpMenuIndex = 6;

    // And, I enable security
    LayoutSteps.enableSecurityUserLoggedIn();
    // And I set the authenticated user role to admin
    LayoutSteps.setAdminRole();

    NavbarSteps.openSubmenus(setupMenuIndex);
    // Then I should see submenus for admin role
    const adminRoleSetupSubmenuItems = [
      "Repositories",
      "Users and Access",
      "ACL Management",
      "My Settings",
      "Connectors",
      "Cluster",
      "Plugins",
      "Namespaces",
      "Autocomplete",
      "RDF Rank",
      "JDBC",
      "SPARQL Templates",
      "License"
    ]
    assertSubmenuItems(setupMenuIndex, adminRoleSetupSubmenuItems);

    NavbarSteps.openSubmenus(monitoringMenuIndex);
    const adminMonitoringMenuItems = [
      'Queries and Updates',
      'Backup and Restore',
      'System'
    ]
    assertSubmenuItems(monitoringMenuIndex, adminMonitoringMenuItems);
    // close the opened submenu
    NavbarSteps.openSubmenus(monitoringMenuIndex);

    NavbarSteps.openSubmenus(helpMenuIndex);
    const adminHelpSubmenuItems = [
      'Interactive guides',
      'REST API',
      'Documentation',
      'Tutorials',
      'Support',
      'System information'
    ]
    assertSubmenuItems(helpMenuIndex, adminHelpSubmenuItems);

    // When I set the authenticated user role to user
    LayoutSteps.setUserRole();

    NavbarSteps.openSubmenus(setupMenuIndex);
    // Then I should see 9 sub menu items for Setup
    const userRoleSetupSubmenuItems = [
      "My Settings",
      "Connectors",
      "Cluster",
      "Plugins",
      "Namespaces",
      "Autocomplete",
      "RDF Rank",
      "JDBC",
      "SPARQL Templates",
    ]
    assertSubmenuItems(setupMenuIndex, userRoleSetupSubmenuItems);

    NavbarSteps.openSubmenus(monitoringMenuIndex);
    const userMonitoringMenuItems = [
      'Queries and Updates',
      'Backup and Restore',
    ]
    assertSubmenuItems(monitoringMenuIndex, userMonitoringMenuItems);
    // close the opened submenu
    NavbarSteps.openSubmenus(monitoringMenuIndex);

    NavbarSteps.openSubmenus(helpMenuIndex);
    const userHelpSubmenuItems = [
      'Interactive guides',
      'REST API',
      'Documentation',
      'Tutorials',
      'Support',
    ]
    assertSubmenuItems(helpMenuIndex, userHelpSubmenuItems);
    // close the opened submenu
    NavbarSteps.openSubmenus(monitoringMenuIndex);

    // When I set the authenticated user role to repo manager
    LayoutSteps.setRepoManagerRole();

    // Then I should see 10 sub menu items for Setup
    NavbarSteps.openSubmenus(setupMenuIndex);
    const repoManagerRoleSetupSubmenuItems = [
      "Repositories",
      "My Settings",
      "Connectors",
      "Cluster",
      "Plugins",
      "Namespaces",
      "Autocomplete",
      "RDF Rank",
      "JDBC",
      "SPARQL Templates",
    ]
    assertSubmenuItems(setupMenuIndex, repoManagerRoleSetupSubmenuItems);

    // Admin and Repo Manager should see the same submenu items for Monitoring
    NavbarSteps.openSubmenus(monitoringMenuIndex);
    assertSubmenuItems(monitoringMenuIndex, adminMonitoringMenuItems);
    // close the opened submenu
    NavbarSteps.openSubmenus(monitoringMenuIndex);

    // Repo manager and user should see the same submenu items for Help
    NavbarSteps.openSubmenus(helpMenuIndex);
    assertSubmenuItems(helpMenuIndex, userHelpSubmenuItems);
  });

  it('should hide and display navbar and header based on security', () => {
    // Given I've visited the layout page and loaded menu items for the navbar
    LayoutSteps.visit();
    LayoutSteps.disableSecurity();

    // Then I should see the header and navbar
    HeaderSteps.getHeader().should('exist');
    NavbarSteps.getRootMenuItems().should('have.length', 7);

    // When I enable security and reset the authenticated user
    // (having a user in context would be treated as an external authenticated user)
    LayoutSteps.resetAuthUser();
    LayoutSteps.enableSecurity();

    // Then I shouldn't see the header and navbar
    HeaderSteps.getHeader().should('not.exist');
    NavbarSteps.getRootMenuItems().should('have.length', 0);

    // When I disable security
    LayoutSteps.disableSecurity();

    // Then I should see the header and navbar
    HeaderSteps.getHeader().should('exist');
    NavbarSteps.getRootMenuItems().should('have.length', 7);
  })
});
