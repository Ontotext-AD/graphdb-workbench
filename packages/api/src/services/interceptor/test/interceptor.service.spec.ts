import {InterceptorService} from '../interceptor.service';
import {HttpInterceptor} from '../../../models/interceptor/http-interceptor';
import {HttpRequest} from '../../../models/http/http-request';
import {ModelList} from '../../../models/common';

class PriorityPreInterceptor extends HttpInterceptor<HttpRequest> {
  priority = 1;

  shouldProcess(): boolean {
    return true;
  }

  process(request: HttpRequest): Promise<HttpRequest> {
    request.url += 'priorityPre';
    return Promise.resolve(request);
  }
}

class NoPriorityPreInterceptor extends HttpInterceptor<HttpRequest> {
  shouldProcess(): boolean {
    return true;
  }

  process(request: HttpRequest): Promise<HttpRequest> {
    request.url += 'noPriority';
    return Promise.resolve(request);
  }
}

class NoPriorityPostInterceptor extends HttpInterceptor<Response> {
  process(response: Response): Promise<Response> {
    return Promise.resolve({...response, url: 'modifiedInPostProcess'});
  }

  shouldProcess(): boolean {
    return true;
  }
}

describe('Interceptor Service', () => {
  let interceptorService: InterceptorService;
  let priorityRequestInterceptor: PriorityPreInterceptor;
  let noPriorityPreInterceptor: NoPriorityPreInterceptor;

  beforeEach(() => {
    interceptorService = new InterceptorService();
    priorityRequestInterceptor = new PriorityPreInterceptor();
    noPriorityPreInterceptor = new NoPriorityPreInterceptor();
    interceptorService.registerRequestInterceptors(new ModelList([
      priorityRequestInterceptor,
      noPriorityPreInterceptor
    ]));
    interceptorService.registerResponseInterceptors(new ModelList([
      new NoPriorityPostInterceptor()
    ]));
  });

  test('should post-process interceptors, which shouldPostProcess the response', async () => {
    //Given I post-process a response
    const response = await interceptorService.postProcess({url: '/original'} as Response);
    // Then, I expect the response to have been modified only by NoPriorityHttpInterceptor, because it shouldPostProcess
    expect(response.url).toEqual('modifiedInPostProcess');
  });

  test('should prioritise interceptors', async () => {
    // Given, I pre-process a request with two interceptors, which have different priority
    const result = await interceptorService.preProcess(new HttpRequest(
      {
        url: '/original',
        method: 'GET',
        headers: {},
        body: null
      }));
    // Then, I expect the interceptor with higher priority to be executed first
    // Because both interceptors shouldPreProcess the request and the PriorityHttpInterceptor has higher priority
    expect(result.url).toEqual('/originalpriorityPrenoPriority');
  });

  test('should stop interceptors, when promise is rejected', async () => {
    // Given, I have a pre-process interceptor that rejects
    jest.spyOn(priorityRequestInterceptor, 'process').mockRejectedValue('rejected error');
    const secondInterceptorProcess = jest.spyOn(noPriorityPreInterceptor, 'process');

    // When, I try to process a request
    try {
      await interceptorService.preProcess(new HttpRequest(
        {
          url: '/original',
          method: 'GET',
          headers: {},
          body: null
        }));
      fail('Expected an error to be thrown');
    } catch (error) {
      // Then, I expect the error to be thrown by the interceptor
      expect(error).toBe('rejected error');
      // And the second interceptor should not have been executed
      expect(secondInterceptorProcess).not.toHaveBeenCalled();
    }
  });

  test('should stop interceptors, when error is thrown', async () => {
    // Given, I have a pre-process interceptor that throws an error
    jest.spyOn(priorityRequestInterceptor, 'process').mockImplementation(() => {
      throw new Error('error during processing');
    });
    const secondInterceptorProcess = jest.spyOn(noPriorityPreInterceptor, 'process');

    // When, I try to process a request
    try {
      await interceptorService.preProcess(new HttpRequest(
        {
          url: '/original',
          method: 'GET',
          headers: {},
          body: null
        }));
      // We shouldn't get to here, as we expect an error to be thrown
      fail('Expected an error to be thrown');
      // @ts-expect-error error should be thrown from process
    } catch (error: Error) {
      // Then, I expect the error to be thrown by the interceptor
      expect(error.message).toEqual('error during processing');
      // And the second interceptor should not have been executed
      expect(secondInterceptorProcess).not.toHaveBeenCalled();
    }
  });
});
