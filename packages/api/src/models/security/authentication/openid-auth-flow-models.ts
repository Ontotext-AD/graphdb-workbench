export enum OpenIdAuthFlowType {
  CODE = 'code',
  CODE_NO_PKCE = 'code_no_pkce',
  IMPLICIT = 'implicit'
}

export enum OpenIdResponseType {
  CODE = 'code',
  TOKEN = 'token id_token'
}

export interface AuthFlowParams {
  code?: string | null;
  state?: string | null;
  id_token?: string | null;
  [key: string]: string | null | undefined;
}

export interface OpenIdTokens {
  access_token?: string | null;
  id_token?: string | null;
  refresh_token?: string | null;
}
