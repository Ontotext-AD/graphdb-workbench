import {OntoToastrService} from '../onto-toastr.service';

describe('OntoToastrService', () => {
  let service: OntoToastrService;
  window.crypto.randomUUID = jest.fn();

  beforeEach(() => {
    service = new OntoToastrService();
  });

  test('should call the correct method for each toast type', () => {
    // Given, I have mocked the service methods
    const errorSpy = jest.spyOn(service, 'error');
    const infoSpy = jest.spyOn(service, 'info');
    const successSpy = jest.spyOn(service,'success');
    const warningSpy = jest.spyOn(service, 'warning');

    // When I call the methods with different toast messages
    // Then I expect the corresponding method to be called with the correct message
    service.error('Error message');
    expect(errorSpy).toHaveBeenCalledWith('Error message');

    service.info('Info message');
    expect(infoSpy).toHaveBeenCalledWith('Info message');

    service.success('Success message');
    expect(successSpy).toHaveBeenCalledWith('Success message');

    service.warning('Warning message');
    expect(warningSpy).toHaveBeenCalledWith('Warning message');
  });
});
