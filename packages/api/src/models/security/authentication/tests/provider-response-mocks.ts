export const ProviderResponseMocks = {
  authenticatedUserResponse: {
    username: 'testUser',
    password: '{bcrypt}$2a$10$m/uKS8jQuz9.AVQscZUG5u9TFXhgWWUIzveT5JpocTVL4p6vO7K1K',
    authorities: [
      'ROLE_USER',
      'READ_REPO_*',
      'WRITE_REPO_*'
    ],
    appSettings: {
      DEFAULT_SAMEAS: true,
      DEFAULT_INFERENCE: true,
      EXECUTE_COUNT: true,
      IGNORE_SHARED_QUERIES: false,
      DEFAULT_VIS_GRAPH_SCHEMA: true
    },
    external: false
  },

  adminUserResponse: {
    username: 'admin',
    password: '',
    grantedAuthorities: [
      'ROLE_ADMIN'
    ],
    appSettings: {
      COOKIE_CONSENT: true,
      DEFAULT_SAMEAS: true,
      DEFAULT_INFERENCE: true,
      EXECUTE_COUNT: true,
      IGNORE_SHARED_QUERIES: false,
      DEFAULT_VIS_GRAPH_SCHEMA: true
    },
    dateCreated: 1754309863184,
    gptThreads: []
  },

  loginResponse: {
    username: 'admin',
    password: '[CREDENTIALS]',
    authorities: [
      'ROLE_USER',
      'ROLE_ADMIN',
      'ROLE_MONITORING',
      'ROLE_REPO_MANAGER',
      'ROLE_CLUSTER'
    ],
    appSettings: {
      COOKIE_CONSENT: true,
      DEFAULT_SAMEAS: true,
      DEFAULT_INFERENCE: true,
      EXECUTE_COUNT: true,
      IGNORE_SHARED_QUERIES: false,
      DEFAULT_VIS_GRAPH_SCHEMA: true
    },
    external: false
  }
};
