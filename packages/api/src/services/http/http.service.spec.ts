import {HttpService} from './http.service';
import {TestUtil} from '../utils/test/test-util';

describe('HttpService', () => {

  let httpService: HttpService;

  beforeEach(() => {
    httpService = new HttpService();
  });

  test('request should throw exception if BE throws an error', async () => {

    TestUtil.mockResponse({}, 404, 'Error message from server');

    await expect(httpService.get('http://localhost:8080')).rejects.toEqual(expect.objectContaining({
      status: 404,
      ok: false,
      text: expect.any(Function),
      json: expect.any(Function)
    }));
  });

  test('get should return a response', async () => {
    const response = { message: 'Success' };
    TestUtil.mockResponse(response);

    const result = await httpService.get('http://localhost:8080');

    expect(result).toEqual({...response});
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  });

  test('post should return a response', async () => {
    const response = { id: 1, message: 'Created' };
    TestUtil.mockResponse(response);

    const result = await httpService.post('http://localhost:8080', { name: 'Test' });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
  });

  test('put should return a response', async () => {
    const response = { message: 'Updated' };
    TestUtil.mockResponse(response);

    const result = await httpService.put('http://localhost:8080', { name: 'Updated' });

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
  });

  test('delete should return a response', async () => {
    const response = { message: 'Deleted' };
    TestUtil.mockResponse(response);

    const result = await httpService.delete('http://localhost:8080');

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  });
});
