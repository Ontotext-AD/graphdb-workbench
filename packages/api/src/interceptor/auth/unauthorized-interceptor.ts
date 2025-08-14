import {HttpInterceptor} from '../../models/interceptor/http-interceptor';
import {navigate} from '../../services/utils';
import {WindowService} from '../../services/window';

export class UnauthorizedInterceptor extends HttpInterceptor<Response> {
  process(data: Response): Promise<Response> {
    // If backend returns 401, it means that the user is not authenticated.
    // Se we have to remove the JWT token from local storage
    if (localStorage.getItem('ontotext.gdb.auth.jwt')) {
      localStorage.removeItem('ontotext.gdb.auth.jwt');
      navigate('login');
      // There is scenario when 401 is thrown during bootstrap and
      // when user is logged the workbench is not properly loaded
      // For example if languages are not loaded.
      // So we need to reload the page to ensure that everything is loaded properly.
      WindowService.getWindow().location.reload();
    }
    return Promise.reject(data);
  }

  shouldProcess(data: Response): boolean {
    return 401 === data.status;
  }
}
