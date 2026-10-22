import {ProductInfoContextService, service, UriUtil} from '@ontotext/workbench-api';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';

export const documentationLinkResolve: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const productInfoService = service(ProductInfoContextService);
  const productInfo = productInfoService.getProductInfo();
  const documentationUrl = route.data['documentationUrl'];
  if (!productInfo || !documentationUrl) {
    return '';
  }

  return UriUtil.resolveDocumentationUrl(productInfo.shortVersion, documentationUrl);
};
