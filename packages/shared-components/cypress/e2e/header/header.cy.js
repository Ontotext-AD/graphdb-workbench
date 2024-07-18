import {HeaderSteps} from "../../steps/header/header-steps";

describe('Header', () => {
  it('Should render header', () => {
    HeaderSteps.visit();
    HeaderSteps.getHeader().should('be.visible');
  });
});
