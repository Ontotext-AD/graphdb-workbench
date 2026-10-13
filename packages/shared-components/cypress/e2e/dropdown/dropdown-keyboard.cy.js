import {DropdownSteps} from "../../steps/dropdown/dropdown-steps";

const DROPDOWN = '#dropdown2';
const FIRST_DROPDOWN = '#dropdown1';
const OTHER_DROPDOWN = '#dropdown3';

describe('Dropdown keyboard access', () => {
  beforeEach(() => {
    // Given I visit a page with a dropdown with options
    DropdownSteps.visit();
    DropdownSteps.getDropdownButton(DROPDOWN).should('be.visible');
  });

  it('should expose the open state of the menu as a disclosure', () => {
    // Then the button should be collapsed and control the menu
    DropdownSteps.getDropdownMenu(DROPDOWN).invoke('attr', 'id').then((menuId) => {
      DropdownSteps.getDropdownButton(DROPDOWN)
        .should('have.attr', 'aria-expanded', 'false')
        .and('have.attr', 'aria-controls', menuId)
        .and('not.have.attr', 'aria-haspopup');
    });

    // When I open the menu with the keyboard
    DropdownSteps.focusDropdownButton(DROPDOWN);
    DropdownSteps.pressEnter();

    // Then the button should be expanded
    DropdownSteps.getDropdownButton(DROPDOWN).should('have.attr', 'aria-expanded', 'true');
  });

  it('should give each dropdown its own menu id', () => {
    DropdownSteps.getDropdownMenu(FIRST_DROPDOWN).invoke('attr', 'id').then((firstMenuId) => {
      DropdownSteps.getDropdownMenu(DROPDOWN).should('have.attr', 'id').and('not.equal', firstMenuId);
    });
  });

  it('should close the menu on Escape and return the focus to the button', () => {
    // Given I opened the menu and moved the focus into it
    DropdownSteps.focusDropdownButton(DROPDOWN);
    DropdownSteps.pressEnter();
    DropdownSteps.pressTab();
    DropdownSteps.getDropdownOptions(DROPDOWN).eq(0).should('be.focused');

    // When I press Escape
    DropdownSteps.pressEscape();

    // Then the menu should be closed
    DropdownSteps.getDropdownMenu(DROPDOWN).should('be.hidden');
    // And the focus should be on the button
    DropdownSteps.getDropdownButton(DROPDOWN)
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('should return the focus to the button, when an option is selected with the keyboard', () => {
    // Given I opened the menu and moved the focus to the second option
    DropdownSteps.focusDropdownButton(DROPDOWN);
    DropdownSteps.pressEnter();
    DropdownSteps.pressTab();
    DropdownSteps.pressTab();
    DropdownSteps.getDropdownOptions(DROPDOWN).eq(1).should('be.focused');

    // When I select it
    DropdownSteps.pressEnter();

    // Then the menu should be closed
    DropdownSteps.getDropdownMenu(DROPDOWN).should('be.hidden');
    // And the focus should be on the button
    DropdownSteps.getDropdownButton(DROPDOWN).should('be.focused');
  });

  it('should not move the focus, when Escape is pressed outside the dropdown', () => {
    // Given the menu is open, but the focus is in another dropdown
    DropdownSteps.openDropdown(DROPDOWN);
    DropdownSteps.focusDropdownButton(OTHER_DROPDOWN);

    // When I press Escape
    DropdownSteps.pressEscape();

    // Then the menu should be closed
    DropdownSteps.getDropdownMenu(DROPDOWN).should('be.hidden');
    // And the focus should stay where it was
    DropdownSteps.getDropdownButton(OTHER_DROPDOWN).should('be.focused');
  });
});
