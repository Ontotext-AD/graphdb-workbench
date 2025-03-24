const userMenu = document.querySelector('onto-user-menu');

userMenu.user = {
  username: 'john.doe'
}

const setExternalUser = () => {
  userMenu.user = {
    ...userMenu.user,
    external: true
  }
}
