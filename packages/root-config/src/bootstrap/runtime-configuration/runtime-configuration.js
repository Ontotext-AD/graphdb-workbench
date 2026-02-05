import {EventName, EventService, RuntimeConfigurationContextService, service, WindowService} from '@ontotext/workbench-api';

const updateEmbeddedFlag = (queryString) => {
  const runtimeConfig = service(RuntimeConfigurationContextService);
  const queryParams = new URLSearchParams(queryString);
  runtimeConfig.updateRuntimeConfiguration({isEmbedded: queryParams.has('embedded')});
};

export const runtimeConfigurationBootstrap = () => {
  const eventService = service(EventService);

  // Initial update of embedded flag
  updateEmbeddedFlag(WindowService.getLocationQueryParams());

  eventService.subscribe(EventName.NAVIGATION_END, (navigationEndPayload) => {
    updateEmbeddedFlag(new URL(navigationEndPayload.newUrl).search);
  });
  return Promise.resolve();
};
