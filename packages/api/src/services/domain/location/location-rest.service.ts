import {HttpService} from '../../http/http.service';
import {LocationResponse} from './response/location-response';

export class LocationRestService extends HttpService {
  getActiveLocation(): Promise<LocationResponse> {
    return this.get<LocationResponse>('rest/locations/active');
  }
}
