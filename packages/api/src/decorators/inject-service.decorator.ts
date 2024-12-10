import { ServiceProvider } from '../providers';
import { Service } from '../providers/service/service';

export function InjectService(serviceClass: new () => Service) {
  return function (target: unknown, propertyKey: string) {
    const serviceInstance = ServiceProvider.get(serviceClass);
      console.log(`Injecting ${propertyKey} with instance of service ${serviceClass.name} in target`, target);
      Object.defineProperty(target, propertyKey, {
          get() {
              return serviceInstance;
          },
          enumerable: true,
          configurable: true,
      });
  };
}
