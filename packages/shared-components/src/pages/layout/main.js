const layoutElement = document.querySelector("onto-layout");

const setUserRole = (role) => {
  setAuthUser({
    ...user,
    authorities: authorityToRolesMap[role]
  });
};

const setSecurity = (enabled) => {
  setSecurityConfig({
    enabled: enabled
  });
}

const user = {
  username: 'user',
  password: '{bcrypt}$2a$10$JLkoDjlfMF8i9IOsHmsCie3tXCR.FedIlhxq1hqyNF8OmrODS4ca.',
  authorities: [],
  appSettings: {
    DEFAULT_SAMEAS: true,
    DEFAULT_INFERENCE: true,
    EXECUTE_COUNT: true,
    IGNORE_SHARED_QUERIES: false,
    DEFAULT_VIS_GRAPH_SCHEMA: true,
    COOKIE_CONSENT: {
      policyAccepted: true,
      statistic: true,
      thirdParty: true,
      updatedAt: 1738066723443
    }
  },
  // external to mimic that the user is authenticated
  external: true
}

const authorityToRolesMap = {
  ROLE_ADMIN: [
    "ROLE_USER",
    "ROLE_ADMIN",
    "ROLE_MONITORING",
    "ROLE_REPO_MANAGER",
    "ROLE_CLUSTER"
  ],
  ROLE_REPO_MANAGER: [
    "ROLE_USER",
    "ROLE_MONITORING",
    "ROLE_REPO_MANAGER"
  ],
  ROLE_USER: [
    'ROLE_USER'
  ]
}
