import {MapperProvider} from '../providers';
import {Mapper} from '../providers/mapper/mapper';

export function InjectMapper(mapperClass: new () => Mapper<unknown>) {
  return function (target: unknown, propertyKey: string) {
    const mapperInstance = MapperProvider.get(mapperClass);
      console.log(`Injecting ${propertyKey} with instance of ${mapperClass.name}`);
    Object.defineProperty(target, propertyKey, {
      value: mapperInstance,
      writable: false,
    });
  };
}
