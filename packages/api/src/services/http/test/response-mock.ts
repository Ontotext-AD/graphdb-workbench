export class ResponseMock {
  private readonly _url: string;
  private _response: unknown = undefined;
  private _status = 200;
  private _message = '';
  private _headers?: unknown = undefined;

  constructor(url: string) {
    this._url = url;
  }

  getUrl(): string | undefined {
    return this._url;
  }

  setResponse(value: unknown) {
    this._response = value;
    return this;
  }
  getResponse(): unknown {
    return this._response;
  }

  setStatus(value: number) {
    this._status = value || 200;
    return this;
  }

  getStatus(): number {
    return this._status;
  }

  setMessage(value: string) {
    this._message = value;
    return this;
  }

  getMessage(): string | undefined {
    return this._message;
  }

  getHeaders(): unknown {
    return this._headers;
  }

  setHeaders(headers: unknown) {
    this._headers = headers;
    return this;
  }
}
