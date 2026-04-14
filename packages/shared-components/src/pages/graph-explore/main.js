const graphExploreSplitButtonElement = document.getElementById('onto-graph-explore-split-button-id');
const graphConfigs = [
  {
    id: 'de99fd5de7f94ef98f1875dff55fc1c9',
    name: 'Graph Config 1',
  },
  {
    id: '94cab6579df445c68c454b2156013811',
    name: 'Graph Config 2'
  }
];

graphExploreSplitButtonElement.addEventListener('graphExplore', (event) => {
  const eventConsole = document.getElementById('event-console');
  eventConsole.innerHTML = JSON.stringify(event.detail);
});

graphExploreSplitButtonElement.fetchGraphConfigs = () => Promise.resolve(graphConfigs);

// eslint-disable-next-line no-unused-vars
function configureEmptyGraphConfigs() {
  graphExploreSplitButtonElement.fetchGraphConfigs = () => Promise.resolve([]);
}
