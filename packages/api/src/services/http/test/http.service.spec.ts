import {HttpService} from '../http.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from './response-mock';
import {HttpInterceptor} from '../../../models/interceptor/http-interceptor';
import {HttpRequest} from '../../../models/http/http-request';
import {ServiceProvider} from '../../../providers';
import {InterceptorService} from '../../interceptor/interceptor.service';
import {ModelList} from '../../../models/common';

class PreInterceptor extends HttpInterceptor<HttpRequest> {
  shouldProcess(): boolean {
    return true;
  }

  process(request: HttpRequest): Promise<HttpRequest> {
    request.url += '/intercepted';
    return Promise.resolve(request);
  }
}

class PostInterceptor extends HttpInterceptor<Response> {
  process(response: Response): Promise<Response> {
    return Promise.resolve({...response, json: () => 'interceptedResponseBody' } as unknown as Response);
  }

  shouldProcess(): boolean {
    return true;
  }
}

describe('HttpService', () => {

  let httpService: HttpService;

  beforeEach(() => {
    httpService = new HttpService();
  });

  test('request should throw exception if BE throws an error', async () => {
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setStatus(404).setMessage('Error message from server'));

    await expect(httpService.get(url)).rejects.toEqual(expect.objectContaining({
      status: 404,
      ok: false,
      text: expect.any(Function),
      json: expect.any(Function)
    }));
  });

  test('get should return a response', async () => {
    const response = { message: 'Success' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.get(url);

    expect(result).toEqual({...response});
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  });

  test('post should return a response', async () => {
    const response = { id: 1, message: 'Created' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.post(url, { name: 'Test' });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
  });

  test('put should return a response', async () => {
    const response = { message: 'Updated' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.put(url, { name: 'Updated' });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
  });

  test('delete should return a response', async () => {
    const response = { message: 'Deleted' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.delete(url);

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  });

  test('patch should return a response', async () => {
    const response = { message: 'Patched' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.patch(url, { name: 'Updated' });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({name: 'Updated'})
    });
  });

  test('should pre-process requests and post-process responses', async () => {
    // Given, I have registered pre- and post-interceptors
    const interceptorService = new InterceptorService();
    interceptorService.registerRequestInterceptors(new ModelList([new PreInterceptor()]));
    interceptorService.registerResponseInterceptors(new ModelList([new PostInterceptor()]));

    // And, I create a new HttpService with the registered interceptors
    jest.spyOn(ServiceProvider, 'get').mockImplementation(() => interceptorService);
    const httpServiceWithInterceptor = new HttpService();

    const response = { message: 'intercepted' };
    // When, I provide an endpoint URL
    const url = '/original';

    // Then, I expect the actual request to have '/intercepted' appended to the URL
    TestUtil.mockResponse(new ResponseMock(`${url}/intercepted`).setResponse(response));

    const result = await httpServiceWithInterceptor.get(url);

    // And, I expect the post-processed response body to be 'interceptedResponseBody'
    expect(result).toEqual('interceptedResponseBody');
  });
});
