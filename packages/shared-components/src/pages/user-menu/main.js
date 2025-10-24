const userMenu = document.querySelector('onto-user-menu');

userMenu.user = {
  username: 'john.doe'
};

userMenu.securityConfig = {
  hasExternalAuthUser: false
};

// eslint-disable-next-line no-unused-vars
const updateSecurityConfig = () => {
  // update security config to trigger strategy resolve
  setSecurityConfig({...userMenu.securityConfig});
};
