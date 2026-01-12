import {EventName, EventService, RuntimeConfigurationContextService, service} from '@ontotext/workbench-api';

export const runtimeConfigurationBootstrap = () => {
  const eventService = service(EventService);
  eventService.subscribe(EventName.NAVIGATION_END, (navigationEndPayload) => {
    const runtimeConfig = service(RuntimeConfigurationContextService);
    const queryParams = new URLSearchParams(new URL(navigationEndPayload.newUrl).search);
    runtimeConfig.updateRuntimeConfiguration({isEmbedded: queryParams.has('embedded')});
  });
  return Promise.resolve();
};
