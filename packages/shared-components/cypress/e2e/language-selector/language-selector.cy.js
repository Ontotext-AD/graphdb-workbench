import {BaseSteps} from "../../steps/base-steps";
import {LanguageSelectorSteps} from "../../steps/language-selector/language-selector-steps";

describe('Language selector', () => {
  it('Should change language', () => {
    // When I visit a pager where header is displayed.
    LanguageSelectorSteps.visit();
    // Then I expect the language selector to be present.
    LanguageSelectorSteps.getLanguageSelector().should('be.visible');
    // and default English language be selected.
    LanguageSelectorSteps.getLanguageSelectorDropdownToggleButton().contains('en');
    LanguageSelectorSteps.openLanguageSelectorDropdown();
    LanguageSelectorSteps.getLanguageSelectorDropdownItem(0).contains('en · English');

    // When I select other option
    LanguageSelectorSteps.selectLanguage(1)
    // then I expect the French language be selected.
    LanguageSelectorSteps.getLanguageSelectorDropdownToggleButton().contains('fr');
    LanguageSelectorSteps.openLanguageSelectorDropdown();
    LanguageSelectorSteps.getLanguageSelectorDropdownItem(0).contains('en · Anglais');

    // When I click on select language button
    LanguageSelectorSteps.getLanguageSelectorDropdownToggleButton().click();
    // Then I expect the dropdown be closed.
    LanguageSelectorSteps.getLanguageSelectorOptions(0).should('not.be.visible');

    // When I open the language selector dropdown
    LanguageSelectorSteps.openLanguageSelectorDropdown();
    LanguageSelectorSteps.getLanguageSelectorOptions(0).should('have.length', 2);
    // and click outside dropdown
    BaseSteps.clickOutsideElement();
    // Then I expect the dropdown be closed.
    LanguageSelectorSteps.getLanguageSelectorOptions(0).should('not.be.visible');
  });
});
