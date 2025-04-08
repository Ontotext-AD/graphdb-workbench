import {HttpRequest} from '../../models/http/http-request';
import {RESPONSE_INTERCEPTORS, REQUEST_INTERCEPTORS} from '../../interceptor/interceptors';
import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {ModelList} from '../../models/common';

/**
 * Service responsible for managing and executing HTTP interceptors.
 */
export class InterceptorService {
  private preProcessors = new ModelList<HttpInterceptor<HttpRequest>>();
  private postProcessors = new ModelList<HttpInterceptor<Response>>();

  /**
   * Initializes a new instance of the InterceptorService class.
   * This constructor sets up the default pre-processors and post-processors, defined in
   * {@link RESPONSE_INTERCEPTORS} and {@link REQUEST_INTERCEPTORS} lists.
   * It sorts the interceptors based on their priority using the sortInterceptors method.
   */
  constructor() {
    this.registerRequestInterceptors(REQUEST_INTERCEPTORS);
    this.registerResponseInterceptors(RESPONSE_INTERCEPTORS);
  }

  /**
   * Chains all interceptors, which {@link HttpInterceptor#shouldPreProcess should pre-process} the request.
   * @param request The initial HTTP request.
   * @returns A promise that resolves to the final processed HTTP request.
   */
  async preProcess(request: HttpRequest): Promise<HttpRequest> {
    let processedRequest = request;
    for (const interceptor of this.preProcessors.getItems()) {
      if (interceptor.shouldProcess(processedRequest)) {
        processedRequest = await interceptor.process(processedRequest);
      }
    }
    return processedRequest;
  }

  /**
   * Chains all interceptors, which {@link HttpInterceptor#shouldPostProcess should post process} the response.
   * @param response The initial HTTP response.
   * @returns A promise that resolves to the final processed HTTP response.
   */
  async postProcess(response: Response): Promise<Response> {
    let processedResponse = response;
    for (const interceptor of this.postProcessors.getItems()) {
      if (interceptor.shouldProcess(processedResponse)) {
        processedResponse = await interceptor.process(processedResponse);
      }
    }
    return processedResponse;
  }

  /**
   * Registers new pre-processors for HTTP requests.
   * Adds the provided elements to the existing pre-processors and sorts all elements again.
   *
   * @param preProcessors - A ModelList containing HttpInterceptor instances for HttpRequest objects.
   *                        These interceptors will be used to pre-process HTTP requests.
   */
  registerRequestInterceptors(preProcessors: ModelList<HttpInterceptor<HttpRequest>>): void {
    this.preProcessors.addItems(preProcessors.getItems());
    this.sortInterceptors(this.preProcessors);
  }

  /**
   * Registers new post-processors for HTTP responses.
   * Adds the provided elements to the existing postProcessors and sorts all elements again.
   *
   * @param postProcessors - An array containing HttpInterceptor instances for Response objects.
   *                         These interceptors will be used to post-process HTTP responses.
   */
  registerResponseInterceptors(postProcessors: ModelList<HttpInterceptor<Response>>): void {
    this.postProcessors.addItems(postProcessors.getItems());
    this.sortInterceptors(this.postProcessors);
  }

  private sortInterceptors<T extends HttpRequest | Response>(interceptors: ModelList<HttpInterceptor<T>>) {
    interceptors.sort((a, b) => b.priority - a.priority);
  }
}
