import { OntoToastrMapper } from '../onto-toastr.mapper';
import { Notification } from '../../../../models/notification';
import { ToastType } from '../../../../models/toastr';
import { ClassNotInitializableError } from '../../../../error/class-not-initializable/class-not-initializable-error';
import { NotificationParam } from '../../../../models/notification/notification-param';

describe('OntoToastrMapper', () => {
  it('should map Notification.type to corresponding ToastType (ERROR)', () => {
    const n = Notification.error('ERR_CODE').withTitle('Error Title');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.type).toBe(ToastType.ERROR);
    expect(toast.message).toBe('ERR_CODE');
    expect(toast.config?.title).toBe('Error Title');
  });

  it('should map Notification.type to corresponding ToastType (SUCCESS)', () => {
    const n = Notification.success('S_CODE').withTitle('Success Title');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.type).toBe(ToastType.SUCCESS);
  });

  it('should map Notification.type to corresponding ToastType (WARNING)', () => {
    const n = Notification.warning('W_CODE');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.type).toBe(ToastType.WARNING);
  });

  it('should map Notification.type to corresponding ToastType (INFO)', () => {
    const n = Notification.info('I_CODE');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.type).toBe(ToastType.INFO);
  });

  it('should default to INFO when Notification.type is undefined', () => {
    const n = new Notification('NO_TYPE_CODE');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.type).toBe(ToastType.INFO);
  });

  it('should preserve code as message and title in config', () => {
    const n = new Notification('SOME_CODE').withTitle('Some Title');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.message).toBe('SOME_CODE');
    expect(toast.config?.title).toBe('Some Title');
  });

  it('should convert parameters to TranslationParameter[] with stringified values', () => {
    const params = {
      [NotificationParam.SHOULD_TOAST]: true,
      count: 42,
      label: 'value',
    } as Record<string, unknown>;

    const n = Notification.info('PARAM_CODE').withTitle('Params Title').withParameters(params);
    const toast = OntoToastrMapper.fromNotification(n);

    expect(toast.config?.translationParams).toBeDefined();
    const tp = toast.config?.translationParams ?? [];
    expect(tp.length).toBe(3);
    // Order is not guaranteed, verify contents regardless of order
    expect(tp).toEqual(
      expect.arrayContaining([
        { key: NotificationParam.SHOULD_TOAST, value: 'true' },
        { key: 'count', value: '42' },
        { key: 'label', value: 'value' },
      ])
    );
  });

  it('should return empty translationParams array when parameters are undefined', () => {
    const n = Notification.info('NO_PARAMS');
    const toast = OntoToastrMapper.fromNotification(n);
    expect(toast.config?.translationParams).toEqual([]);
  });

  it('should throw ClassNotInitializableError when trying to instantiate the class', () => {
    // Bypass TS private constructor check in runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor: any = OntoToastrMapper as unknown as new() => any;
    expect(() => new Ctor()).toThrow(ClassNotInitializableError);
  });
});
