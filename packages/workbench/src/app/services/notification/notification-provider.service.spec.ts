import {NotificationParam, NotificationType, notify} from '@ontotext/workbench-api';
import {NotificationProviderService} from './notification-provider.service';
import {NotificationOptions} from '../../models/notification-options';

jest.mock('@ontotext/workbench-api', () => ({
  ...jest.requireActual('@ontotext/workbench-api'),
  notify: jest.fn()
}));

const mockNotify = notify as jest.MockedFunction<typeof notify>;

describe('NotificationProviderService', () => {
  let service: NotificationProviderService;

  beforeEach(() => {
    service = new NotificationProviderService();
    mockNotify.mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('notification type mapping', () => {
    it('should dispatch a notification with type "error"', () => {
      service.error('Something went wrong');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({code: 'Something went wrong', type: NotificationType.ERROR})
      );
    });

    it('should dispatch a notification with type "info"', () => {
      service.info('Just so you know');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({code: 'Just so you know', type: NotificationType.INFO})
      );
    });

    it('should dispatch a notification with type "success"', () => {
      service.success('Done!');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({code: 'Done!', type: NotificationType.SUCCESS})
      );
    });

    it('should dispatch a notification with type "warning"', () => {
      service.warning('Be careful');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({code: 'Be careful', type: NotificationType.WARNING})
      );
    });
  });

  describe('notification config mapping', () => {
    it('should set the title on the notification', () => {
      const config: NotificationOptions = {title: 'Oops'};
      service.error('Error occurred', config);

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({title: 'Oops'})
      );
    });

    it('should not set a title when one is not provided', () => {
      service.error('Error occurred');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.not.objectContaining({title: expect.anything()})
      );
    });

    it('should always set the SHOULD_TOAST parameter to true', () => {
      service.info('Loading...');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({[NotificationParam.SHOULD_TOAST]: true})
        })
      );
    });

    it('should merge extra parameters with SHOULD_TOAST', () => {
      const config: NotificationOptions = {parameters: {retry: true}};
      service.info('Loading...', config);

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({retry: true, [NotificationParam.SHOULD_TOAST]: true})
        })
      );
    });
  });
});
