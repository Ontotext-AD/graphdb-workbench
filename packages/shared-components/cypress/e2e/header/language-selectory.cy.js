import {HeaderSteps} from "../../steps/header/header-steps";
import {BaseSteps} from "../../steps/base-steps";

describe('Language selector', () => {
  it('Should change language', () => {
    // When I visit a pager where header is displayed.
    HeaderSteps.visit();
    // Then I expect the language selector to be present.
    HeaderSteps.getLanguageSelector().should('be.visible');
    // and default English language be selected.
    HeaderSteps.getLanguageSelectorDropdownToggleButton().contains('en');
    HeaderSteps.openLanguageSelectorDropdown();
    HeaderSteps.getLanguageSelectorDropdownItem(0).contains('en · English')

    // When I select other option
    HeaderSteps.select(1)
    // then I expect the French language be selected.
    HeaderSteps.getLanguageSelectorDropdownToggleButton().contains('fr');
    HeaderSteps.openLanguageSelectorDropdown();
    HeaderSteps.getLanguageSelectorDropdownItem(0).contains('en · Anglais')

    // When I click on select language button
    HeaderSteps.getLanguageSelectorDropdownToggleButton().click();
    // Then I expect the dropdown be closed.
    HeaderSteps.getLanguageSelectorOptions(0).should('not.be.visible');

    // When I open the language selector dropdown
    HeaderSteps.openLanguageSelectorDropdown();
    HeaderSteps.getLanguageSelectorOptions(0).should('have.length', 2);
    // and click outside dropdown
    BaseSteps.clickOutsideElement();
    // Then I expect the dropdown be closed.
    HeaderSteps.getLanguageSelectorOptions(0).should('not.be.visible');
  });
});
