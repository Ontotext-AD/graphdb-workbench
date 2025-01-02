import { ProductInfoMapper } from './product-info.mapper';
import { ProductInfo } from '../../../models/product-info';

describe('ProductInfoMapper', () => {
  let mapper: ProductInfoMapper;

  beforeEach(() => {
    mapper = new ProductInfoMapper();
  });

  it('should map a complete product info object correctly', () => {
    const input = {
      Workbench: '1.0.0',
      productType: 'GraphDB',
      productVersion: '9.10.1',
      sesame: '3.6.0',
      connectors: '5.0.0'
    };

    const result = mapper.mapToModel(input);

    expect(result).toBeInstanceOf(ProductInfo);
    expect(result.workbench).toBe('1.0.0');
    expect(result.productType).toBe('GraphDB');
    expect(result.productVersion).toBe('9.10.1');
    expect(result.sesame).toBe('3.6.0');
    expect(result.connectors).toBe('5.0.0');
  });

  it('should handle missing optional fields', () => {
    const input = {
      Workbench: '1.0.0',
      productType: 'GraphDB',
      productVersion: '9.10.1'
    };

    const result = mapper.mapToModel(input);

    expect(result).toBeInstanceOf(ProductInfo);
    expect(result.workbench).toEqual('1.0.0');
    expect(result.productType).toEqual('GraphDB');
    expect(result.productVersion).toEqual('9.10.1');
    expect(result.sesame).toEqual('');
    expect(result.connectors).toEqual('');
  });
});
