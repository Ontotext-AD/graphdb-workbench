import {
  EventName,
  EventService,
  NavigationEndPayload,
  RuntimeConfigurationContextService,
  service,
  WindowService
} from '@ontotext/workbench-api';

const updateEmbeddedFlag = (queryString: string): void => {
  const runtimeConfig = service(RuntimeConfigurationContextService);
  const queryParams = new URLSearchParams(queryString);
  runtimeConfig.updateRuntimeConfiguration({isEmbedded: queryParams.has('embedded')});
};

export const runtimeConfigurationBootstrap = (): Promise<void> => {
  const eventService = service(EventService);

  // Initial update of embedded flag
  updateEmbeddedFlag(WindowService.getLocationQueryParams());

  eventService.subscribe(EventName.NAVIGATION_END, (navigationEndPayload: NavigationEndPayload) => {
    updateEmbeddedFlag(new URL(navigationEndPayload.newUrl).search);
  });
  return Promise.resolve();
};
