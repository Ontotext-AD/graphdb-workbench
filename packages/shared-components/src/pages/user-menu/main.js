const userMenu = document.querySelector('onto-user-menu');

userMenu.user = {
  username: 'john.doe'
}

userMenu.securityConfig = {
  hasExternalAuthUser: false
}

const setExternalUser = () => {
  userMenu.user = {
    ...userMenu.user,
    external: true,
    userLoggedIn: true
  }

  userMenu.securityConfig = {
    hasExternalAuthUser: true
  }
}
