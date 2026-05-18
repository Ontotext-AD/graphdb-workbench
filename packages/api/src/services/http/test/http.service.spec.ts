import {HttpService} from '../http.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from './response-mock';
import {HttpInterceptor} from '../../../models/interceptor/http-interceptor';
import {HttpRequest} from '../../../models/http/http-request';
import {ServiceProvider} from '../../../providers';
import {InterceptorService} from '../../interceptor/interceptor.service';
import {ModelList} from '../../../models/common';
import {HttpErrorResponse, HttpResponse} from '../../../models/http';

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
    // Return a modified response that will return the intercepted text
    const modified = {
      ...response,
      text: async () => '"interceptedResponseBody"',
      json: async () => 'interceptedResponseBody'
    } as unknown as Response;
    (modified as unknown as Record<string, unknown>)['clone'] = () => ({...modified});
    return Promise.resolve(modified);
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

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  test('request should throw exception if BE throws an error', async () => {
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setStatus(404).setMessage('Error message from server'));

    try {
      await httpService.get(url);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect((error as HttpErrorResponse).status).toBe(404);
      expect((error as HttpErrorResponse).statusText).toBe('');
    }
  });

  test('get should return a response', async () => {
    const response = { message: 'Success' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.get(url);

    expect(result).toEqual({...response});
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
      body: null,
    });
  });

  test('post should return a response', async () => {
    const response = { id: 1, message: 'Created' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.post(url, {body: { name: 'Test' }});

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
      body: JSON.stringify({ name: 'Test' }),
    });
  });

  test('put should return a response', async () => {
    const response = { message: 'Updated' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.put(url, {body: { name: 'Updated' }});

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
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
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
      body: null,
    });
  });

  test('patch should return a response', async () => {
    const response = { message: 'Patched' };
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setResponse(response));

    const result = await httpService.patch(url, {body: { name: 'Updated' }});

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
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

  test('should resolve JSON responses', async () => {
    const responseBody = {test: 'test'};
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(
      new ResponseMock(url)
        .setResponse(responseBody)
        .setHeaders(new Headers({ 'Content-Type': 'application/json' }))
    );

    const result = await httpService.get(url);

    expect(result).toEqual(responseBody);

    TestUtil.mockResponse(
      new ResponseMock(url)
        .setResponse(responseBody)
        .setHeaders(new Headers({ 'Content-Type': 'application/sparql-results+json' }))
    );

    const result2 = await httpService.get(url);

    expect(result2).toEqual(responseBody);
  });

  test('should return string, when response is not json', async () => {
    const responseBody = 'Not JSON';
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(
      new ResponseMock(url)
        .setResponse(responseBody)
        .setHeaders(new Headers({'Content-Type': 'text/plain'}))
    );

    const result = await httpService.get(url);

    expect(typeof result === 'string').toEqual(true);
  });

  test('get with responseType blob should return a Blob', async () => {
    const blobContent = new Blob(['binary data'], {type: 'application/octet-stream'});
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(
      new ResponseMock(url)
        .setBlob(blobContent)
        .setHeaders(new Headers({'Content-Type': 'application/octet-stream'}))
    );

    const result = await httpService.get(url, {responseType: 'blob'});

    expect(result).toBeInstanceOf(HttpResponse);
    expect((result as HttpResponse<Blob>).data).toBeInstanceOf(Blob);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
      body: null,
    });
  });

  test('post with responseType blob should return a Blob', async () => {
    const blobContent = new Blob(['binary data'], {type: 'application/pdf'});
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(
      new ResponseMock(url)
        .setBlob(blobContent)
        .setHeaders(new Headers({'Content-Type': 'application/pdf'}))
    );

    const result = await httpService.post(url, {body: {param: 'value'}, responseType: 'blob'});

    expect(result).toBeInstanceOf(HttpResponse);
    expect((result as HttpResponse<Blob>).data).toBeInstanceOf(Blob);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*'
      },
      body: JSON.stringify({param: 'value'}),
    });
  });

  test('get with responseType blob should return the correct Blob content', async () => {
    const blobData = 'some blob data';
    const blobContent = new Blob([blobData], {type: 'text/plain'});
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(
      new ResponseMock(url)
        .setBlob(blobContent)
        .setHeaders(new Headers({'Content-Type': 'text/plain'}))
    );

    const result = await httpService.get(url, {responseType: 'blob'});

    expect(result).toBeInstanceOf(HttpResponse);
    const blobResult = (result as HttpResponse<Blob>).data as Blob;
    expect(blobResult.size).toEqual(blobContent.size);
    expect(blobResult.type).toEqual(blobContent.type);
  });

  test('get with responseType blob should throw HttpErrorResponse on server error', async () => {
    const url = 'http://localhost:8080';
    TestUtil.mockResponse(new ResponseMock(url).setStatus(500).setMessage('Internal Server Error'));

    try {
      await httpService.get(url, {responseType: 'blob'});
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect((error as HttpErrorResponse).status).toBe(500);
    }
  });
});
