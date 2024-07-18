import {FooterSteps} from "../../steps/footer/footer-steps";

describe('Footer', () => {
  it('Should render footer', () => {
    FooterSteps.visit();
    FooterSteps.getFooter().should('be.visible');
  });
});
