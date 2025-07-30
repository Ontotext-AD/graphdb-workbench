setSecurityConfig({
  enabled: false,
  freeAccess: {enabled: false, authorities: {hasAuthority: () => false}}
});
