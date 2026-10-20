import {inject, Injectable} from '@angular/core';
import {translate} from '@jsverse/transloco';
import {EventDetail, EventType} from 'graphwise-reactodia';
import {GraphwiseReactodiaEventHandler} from '../models/graphwise-reactodia-event-handler';
import {LoggerProvider} from '../../../services/logger/logger-provider';
import {NotificationProviderService} from '../../../services/notification/notification-provider.service';

const ERROR_MESSAGES_PREFIX = 'graph_navigator.errors';

/**
 * Handles the errors graphwise-reactodia reports.
 */
@Injectable()
export class ErrorEventHandler implements GraphwiseReactodiaEventHandler<EventType.ERROR> {
  private readonly notificationProviderService = inject(NotificationProviderService);
  private readonly logger = LoggerProvider.logger;

  canHandle(type: EventType): boolean {
    return type === EventType.ERROR;
  }

  /**
   * Logs the reported error and notifies the user.
   *
   * @param detail - The `error` event detail.
   */
  handle(detail: EventDetail<EventType.ERROR>): void {
    const {code, error} = detail.payload;
    const messageKey = `${ERROR_MESSAGES_PREFIX}.${code.toLowerCase()}`;
    const translated = translate(messageKey);
    const message = translated !== messageKey ? translated : translate(`${ERROR_MESSAGES_PREFIX}.default`);
    this.logger.error(message, error);
    this.notificationProviderService.error(message);
  }
}
