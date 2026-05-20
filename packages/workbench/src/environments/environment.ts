declare const __FEATURE_FLAGS__: Record<string, boolean>;

export const environment = {
  production: false,
  features: __FEATURE_FLAGS__
};
