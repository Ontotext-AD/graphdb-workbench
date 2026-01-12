import {RuntimeConfigurationContextService} from '../runtime-configuration-context.service';

describe('RuntimeConfigurationContextService', () => {
  let runtimeConfigurationContextService: RuntimeConfigurationContextService;

  beforeEach(() => {
    runtimeConfigurationContextService = new RuntimeConfigurationContextService();
  });

  test('Should call the "onRuntimeConfigurationChanged" callback when the runtime configuration changes.', () => {
    const onRuntimeConfigurationChangedCallbackFunction = jest.fn();
    const configuration = {isEmbedded: true};

    // When I register a callback function for runtime configuration changes,
    runtimeConfigurationContextService.onRuntimeConfigurationChanged(onRuntimeConfigurationChangedCallbackFunction);
    // and the runtime configuration is updated,
    runtimeConfigurationContextService.updateRuntimeConfiguration(configuration);

    // Then I expect the callback function to be called with the passed configuration.
    expect(onRuntimeConfigurationChangedCallbackFunction).toHaveBeenLastCalledWith(configuration);
  });

  test('Should stop calling the "onRuntimeConfigurationChanged" callback when unsubscribed from the event.', () => {
    const onRuntimeConfigurationChangedCallbackFunction = jest.fn();

    // Given:
    // I have registered the callback.
    const unsubscribeFunction = runtimeConfigurationContextService.onRuntimeConfigurationChanged(onRuntimeConfigurationChangedCallbackFunction);
    // Clear the first callback call when the callback function is registered.
    onRuntimeConfigurationChangedCallbackFunction.mockClear();

    // When I unsubscribe the function from the runtime configuration event,
    unsubscribeFunction();

    // and the runtime configuration is updated,
    runtimeConfigurationContextService.updateRuntimeConfiguration({isEmbedded: true});

    // Then I expect the callback function to not be called.
    expect(onRuntimeConfigurationChangedCallbackFunction).toHaveBeenCalledTimes(0);
  });

  test('Should merge runtime configuration updates over the existing runtime configuration.', () => {
    runtimeConfigurationContextService.updateRuntimeConfiguration({isEmbedded: true});

    runtimeConfigurationContextService.updateRuntimeConfiguration({isEmbedded: false});

    expect(runtimeConfigurationContextService.getRuntimeConfiguration()).toEqual({isEmbedded: false});
  });
});

