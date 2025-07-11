import { SecurityService } from './security.service';

describe('SecurityService', () => {
  it('should be defined', () => {
    const service = new SecurityService();
    expect(service).toBeDefined();
  });

});
