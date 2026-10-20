import {InjectionToken} from '@angular/core';
import {GraphwiseReactodiaEventHandler} from './graphwise-reactodia-event-handler';

/**
 * The handlers of graphwise-reactodia's notifications, provided as multi providers.
 */
export const GRAPHWISE_REACTODIA_EVENT_HANDLERS = new InjectionToken<GraphwiseReactodiaEventHandler[]>(
  'GRAPHWISE_REACTODIA_EVENT_HANDLERS'
);
