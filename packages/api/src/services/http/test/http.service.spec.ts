import {HttpService} from '../http.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from './response-mock';

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
  });
});
