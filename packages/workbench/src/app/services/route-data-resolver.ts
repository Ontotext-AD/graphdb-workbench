import {ProductInfoContextService, service} from '@ontotext/workbench-api';
import {DocumentationUrlResolver} from './documentation-url-resolver';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';

export const documentationLinkResolve: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const productInfoService = service(ProductInfoContextService);
  const productInfo = productInfoService.getProductInfo();
  if (!productInfo) {
    return '';
  }

  const documentationLink = DocumentationUrlResolver.getDocumentationUrl(productInfo.shortVersion, route.data['documentationUrl']);
  return documentationLink ?? '';
};
