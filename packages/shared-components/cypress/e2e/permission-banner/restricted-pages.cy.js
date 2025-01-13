import {RestrictedPagesSteps} from "../../steps/restricted-pages/restricted-pages-steps";
import {PermissionBannerSteps} from "../../steps/permission-banner/permission-banner-steps";

describe("Restricted pages", () => {
    it('Should restrict the page when current page permissions changed', () => {
        // When: visit SPA where have restricted pages
        RestrictedPagesSteps.visit();
        // Then: I expect the home page be loaded
        RestrictedPagesSteps.getPageContentElement().contains('Welcome to the Home Page');
        // and permission banner is not visible.
        PermissionBannerSteps.getPermissionBanner().should('not.exist');

        // When: I make current page restricted
        RestrictedPagesSteps.makeHomePageRestricted();
        // Then: I expect to see the permission banner
        PermissionBannerSteps.getPermissionBanner().should('exist').and('be.visible');
        // and page content not be visible
        RestrictedPagesSteps.getPageContentElement().should('not.be.visible');

        // When: I make page unrestricted
        RestrictedPagesSteps.makeCurrentPageUnrestricted();
        // Then: I expect to the permission banner not exist
        PermissionBannerSteps.getPermissionBanner().should('not.exist');
        // and page content to be visible again
        RestrictedPagesSteps.getPageContentElement().should('be.visible');
        RestrictedPagesSteps.getPageContentElement().contains('Welcome to the Home Page');

        // Given: current page is restricted
        RestrictedPagesSteps.makeHomePageRestricted();
        // and permission banner exist
        PermissionBannerSteps.getPermissionBanner().should('exist').and('be.visible');
        // When: the permission pages map is empty
        RestrictedPagesSteps.makeRestrictedPagesMapEmpty();
        // Then: I expect to the permission banner not exist
        PermissionBannerSteps.getPermissionBanner().should('not.exist');

        // Given: current page is restricted
        RestrictedPagesSteps.makeHomePageRestricted();
        // and permission banner exist
        PermissionBannerSteps.getPermissionBanner().should('exist').and('be.visible');
        // When: the permission pages map is empty
        RestrictedPagesSteps.makeRestrictedPagesMapUndefined();
        // Then: I expect to the permission banner not exist
        PermissionBannerSteps.getPermissionBanner().should('not.exist');
    });

    it('Should the banner permission appear when navigate to view that is restricted', () => {
        // Given: visit SPA where have restricted pages
        RestrictedPagesSteps.visit();

        // When: I navigate to a restricted page
        RestrictedPagesSteps.navigateToRestrictedPage();
        // Then: I expect to see the permission banner
        PermissionBannerSteps.getPermissionBanner().should('exist').and('be.visible');

        // When: I navigate to an unrestricted page
        RestrictedPagesSteps.navigateToUnrestrictedPage();
        // Then: I expect the permission banner not exist.
        PermissionBannerSteps.getPermissionBanner().should('not.exist');
    });
});
