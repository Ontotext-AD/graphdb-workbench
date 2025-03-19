const addToastMessage = (type) => {
  const toast = {
    message: 'This is a toast message',
    type: type,
  }
  addToastr(toast);
}

const addLongToastMessage = (type) => {
  const toast = {
    message: 'second a little bit longer  adsa sdas dasdasd asd  a sda sda asd as astoast messa' +
      'ged dasd asd asd asd as das das das da sdas a sdasadasdas da dasd as adsas dasda sda sdas asd asd ' +
      ' adsd asd asd asdas d',
    type: type,
  }
  addToastr(toast);
}

const addToastWithLink = (type) => {
  const toast = {
    message: '<a href="#" target="_blank">Click here for more information</a>',
    type: type,
  }
  addToastr(toast);
}
