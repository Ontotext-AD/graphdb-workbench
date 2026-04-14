import {GraphExploreSteps} from '../../steps/graph-explore/graph-explore-steps';

describe('Graph Explore Split Button', () => {
  beforeEach(() => {
    // GIVEN: A page with a graph explore split button is loaded.
    GraphExploreSteps.visit();
  });

  it('should trigger default action when main button is clicked', () => {
    // WHEN: I click on main button
    GraphExploreSteps.clickMainButton();
    // THEN: I expect the 'default' action to be triggered.
    GraphExploreSteps.getEventConsole().should('have.text', '{"action":"default"}');
  });

  it('should trigger select action when a graph configuration is selected', () => {
    // WHEN: I select the first graph configuration
    GraphExploreSteps.toggleDropdown();
    GraphExploreSteps.selectGraphConfig();
    // THEN: I expect the 'select' action to be triggered with the selected graph configuration.
    GraphExploreSteps.getEventConsole().should('have.text', '{"action":"select","graphConfig":{"id":"de99fd5de7f94ef98f1875dff55fc1c9","name":"Graph Config 1"}}');

    // WHEN: I select the second graph configuration
    GraphExploreSteps.toggleDropdown();
    GraphExploreSteps.selectGraphConfig(1);
    // THEN: I expect the 'select' action to be triggered with the selected graph configuration.
    GraphExploreSteps.getEventConsole().should('have.text', '{"action":"select","graphConfig":{"id":"94cab6579df445c68c454b2156013811","name":"Graph Config 2"}}');
  });

  it('should trigger create action when there are no graph configurations and create link is clicked', () => {
    // GIVEN: I have no graph configurations.
    GraphExploreSteps.configureEmptyGraphConfigs();

    // WHEN: I open the dropdown.
    GraphExploreSteps.toggleDropdown();
    // THEN: I expect to see message that informs that there are no graph configurations.
    GraphExploreSteps.getNoConfigurationsMessage().should('contain.text', 'No advanced graph configuration');

    // WHEN: I click on create link.
    GraphExploreSteps.clickCreateGraphConfigLink();
    // THEN: I expect the 'create' action to be triggered.
    GraphExploreSteps.getEventConsole().should('have.text', '{"action":"create"}');
  });
});
