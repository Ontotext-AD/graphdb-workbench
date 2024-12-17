import {DropdownSteps} from "../../steps/dropdown/dropdown-steps";

const DROPDOWN1 = '#dropdown1';
const DROPDOWN2 = '#dropdown2';
const DROPDOWN3 = '#dropdown3';

describe('Dropdown', () => {
  it('Should render dropdown without options', () => {
    // When I visit a page with a dropdown.
    DropdownSteps.visit();

    // Then I expect the dropdown to be present.
    DropdownSteps.getDropdown(DROPDOWN1).should('be.visible')
      .and('contain.text', 'Dropdown 1');
    // TODO: For some reason the tooltip here cannot be triggered programmatically.
    // DropdownSteps.hoverDropdown(DROPDOWN1);
    // DropdownSteps.getTooltip().should('contain', 'dropdown 1 tooltip');

    // When I click on the dropdown.
    DropdownSteps.openDropdown(DROPDOWN1);

    // Then I expect no option to be present.
    DropdownSteps.getDropdownMenu(DROPDOWN1).should('be.hidden');
  });

  it('Should render dropdown with options right aligned', () => {
    // When I visit a page with a dropdown.
    DropdownSteps.visit();

    // Then I expect the dropdown to be present.
    DropdownSteps.getDropdown(DROPDOWN2).should('be.visible')
      .and('contain.text', 'Dropdown 2');

    // When I click on the dropdown.
    DropdownSteps.openDropdown(DROPDOWN2);

    // Then I expect the options to be present.
    DropdownSteps.getDropdownMenu(DROPDOWN2).should('be.visible');
    DropdownSteps.getDropdownOptions(DROPDOWN2).should('have.length', 3);

    // And the options to be right aligned.
    DropdownSteps.getDropdownMenu(DROPDOWN2).should('have.class', 'onto-dropdown-right-item-alignment');
  });

  it('Should render dropdown with options left aligned', () => {
    // When I visit a page with a dropdown.
    DropdownSteps.visit();

    // Then I expect the dropdown to be present.
    DropdownSteps.getDropdown(DROPDOWN3).should('be.visible')
      .and('contain.text', 'Dropdown 3');

    // When I click on the dropdown.
    DropdownSteps.openDropdown(DROPDOWN3);

    // Then I expect the options to be present.
    DropdownSteps.getDropdownMenu(DROPDOWN3).should('be.visible');
    DropdownSteps.getDropdownOptions(DROPDOWN3).should('have.length', 3);

    // And the options to be right aligned.
    DropdownSteps.getDropdownMenu(DROPDOWN3).should('have.class', 'onto-dropdown-left-item-alignment');
  })
});
