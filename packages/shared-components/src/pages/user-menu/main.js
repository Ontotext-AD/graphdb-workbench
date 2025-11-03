const userMenu = document.querySelector('onto-user-menu');

userMenu.user = {
  username: 'john.doe'
};

userMenu.securityConfig = {
  hasExternalAuthUser: false
};

// eslint-disable-next-line no-unused-vars
const setExternalUser = () => {
  // Setting a user and not having a token will result in an external user auth strategy
  setAuthUser({...userMenu.user});
  setSecurityConfig({...userMenu.securityConfig});
};
